from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session, joinedload
from typing import List, Union
import os
from app.models.user import User
from app.models.room import Room
from app.models.Package import Package, PackageBooking, PackageBookingRoom
from app.utils.auth import get_db, get_current_user
from app.utils.booking_id import parse_display_id
from app.schemas.packages import PackageBookingCreate, PackageOut, PackageBookingOut
from fastapi.responses import FileResponse
from app.curd import packages as crud_package
import shutil
import uuid

router = APIRouter(prefix="/packages", tags=["Packages"])

UPLOAD_DIR = "uploads/packages"
CHECKIN_UPLOAD_DIR = "uploads/checkin_proofs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CHECKIN_UPLOAD_DIR, exist_ok=True)


# ------------------- Packages -------------------

@router.post("/", response_model=PackageOut)
async def create_package_api(
    title: str = Form(...),
    description: str = Form(...),
    price: float = Form(...),
    room_type: str = Form(None),
    is_full_property: str = Form("false"),
    images: List[UploadFile] = File([]),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    def parse_bool(value):
        if isinstance(value, bool):
            return value
        return str(value).lower() in {"true", "1", "yes", "on"}

    image_urls = []
    for img in images:
        # Generate unique filename
        filename = f"pkg_{uuid.uuid4().hex}_{img.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(img.file, buffer)
        # Store with leading slash for proper URL construction
        normalized_path = file_path.replace('\\', '/')
        image_urls.append(f"/{normalized_path}")

    return crud_package.create_package(
        db=db,
        title=title,
        description=description,
        price=price,
        room_type=room_type.strip() if room_type and room_type.strip() else None,
        is_full_property=parse_bool(is_full_property),
        image_urls=image_urls
    )





@router.delete("/{package_id}")
def delete_package_api(package_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    success = crud_package.delete_package(db, package_id)
    return {"deleted": success}


# ------------------- Package Bookings -------------------

@router.post("/book", response_model=PackageBookingOut)
def book_package_api(
    booking: PackageBookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = crud_package.book_package(db, booking)
    
    # Calculate booking charges and send confirmation email if email address is provided
    if booking.guest_email and result:
        try:
            from app.utils.email import send_email, create_booking_confirmation_email
            from datetime import datetime, date
            
            # Get package details
            package = db.query(Package).filter(Package.id == booking.package_id).first()
            
            # Calculate stay duration
            check_in_date = result.check_in if isinstance(result.check_in, date) else datetime.strptime(str(result.check_in), '%Y-%m-%d').date()
            check_out_date = result.check_out if isinstance(result.check_out, date) else datetime.strptime(str(result.check_out), '%Y-%m-%d').date()
            stay_nights = max(1, (check_out_date - check_in_date).days)
            
            # Calculate package charges (package price per night per room)
            package_price = package.price if package else 0
            rooms_count = len(result.rooms) if getattr(result, "rooms", None) else 0
            package_charges = package_price * stay_nights * rooms_count if rooms_count else package_price * stay_nights
            
            # Get room details with prices
            rooms_data = []
            for pbr in result.rooms:
                if pbr.room:
                    rooms_data.append({
                        'number': pbr.room.number,
                        'type': pbr.room.type or 'Standard',
                        'price': pbr.room.price or 0
                    })
            
            # Format booking ID (PK-000001)
            formatted_booking_id = f"PK-{str(result.id).zfill(6)}"
            
            email_html = create_booking_confirmation_email(
                guest_name=result.guest_name,
                booking_id=result.id,
                booking_type='package',
                check_in=str(result.check_in),
                check_out=str(result.check_out),
                rooms=rooms_data,
                total_amount=package_charges,
                package_name=package.title if package else None,
                guests={'adults': booking.adults, 'children': booking.children},
                guest_mobile=booking.guest_mobile,
                package_charges=package_charges,
                stay_nights=stay_nights
            )
            
            send_email(
                to_email=booking.guest_email,
                subject=f"Package Booking Confirmation {formatted_booking_id} - Elysian Retreat",
                html_content=email_html,
                to_name=result.guest_name
            )
        except Exception as e:
            # Log error but don't fail the booking
            print(f"Failed to send confirmation email: {str(e)}")
    
    return result

@router.post("/book/guest", response_model=PackageBookingOut, summary="Book a package as a guest")
def book_package_guest_api(
    booking: PackageBookingCreate,
    db: Session = Depends(get_db)
):
    """
    Public endpoint for guests to book a package without authentication.
    """
    try:
        result = crud_package.book_package(db, booking)
        
        # Calculate booking charges and send confirmation email if email address is provided
        if result:
            # Normalize email for sending
            guest_email = None
            try:
                if booking.guest_email:
                    guest_email = booking.guest_email.strip() if isinstance(booking.guest_email, str) and booking.guest_email.strip() else None
            except (AttributeError, TypeError):
                pass
            
            if guest_email:
                try:
                    from app.utils.email import send_email, create_booking_confirmation_email
                    from datetime import datetime, date
                    
                    # Get package details
                    package = db.query(Package).filter(Package.id == booking.package_id).first()
                    
                    # Calculate stay duration
                    check_in_date = result.check_in if isinstance(result.check_in, date) else datetime.strptime(str(result.check_in), '%Y-%m-%d').date()
                    check_out_date = result.check_out if isinstance(result.check_out, date) else datetime.strptime(str(result.check_out), '%Y-%m-%d').date()
                    stay_nights = max(1, (check_out_date - check_in_date).days)
                    
                    # Calculate package charges (package price per night per room)
                    package_price = package.price if package else 0
                    rooms_count = len(result.rooms) if getattr(result, "rooms", None) else 0
                    package_charges = package_price * stay_nights * rooms_count if rooms_count else package_price * stay_nights
                    
                    # Get room details with prices
                    rooms_data = []
                    for pbr in result.rooms:
                        if pbr.room:
                            rooms_data.append({
                                'number': pbr.room.number,
                                'type': pbr.room.type or 'Standard',
                                'price': pbr.room.price or 0
                            })
                    
                    # Format booking ID (PK-000001)
                    formatted_booking_id = f"PK-{str(result.id).zfill(6)}"
                    
                    email_html = create_booking_confirmation_email(
                        guest_name=result.guest_name,
                        booking_id=result.id,
                        booking_type='package',
                        check_in=str(result.check_in),
                        check_out=str(result.check_out),
                        rooms=rooms_data,
                        total_amount=package_charges,
                        package_name=package.title if package else None,
                        guests={'adults': booking.adults, 'children': booking.children},
                        guest_mobile=booking.guest_mobile,
                        package_charges=package_charges,
                        stay_nights=stay_nights
                    )
                    
                    send_email(
                        to_email=guest_email,
                        subject=f"Package Booking Confirmation {formatted_booking_id} - Elysian Retreat",
                        html_content=email_html,
                        to_name=result.guest_name
                    )
                except Exception as e:
                    # Log error but don't fail the booking
                    print(f"Failed to send confirmation email: {str(e)}")
        
        return result
        
    except HTTPException:
        # Re-raise HTTP exceptions (like validation errors) as-is
        raise
    except Exception as e:
        # Log the full error for debugging
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in book_package_guest_api: {str(e)}")
        print(f"Traceback: {error_trace}")
        
        # Return a user-friendly error message
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create package booking: {str(e)}"
        )

@router.get("/bookingsall", response_model=List[PackageBookingOut])
def get_bookings(db: Session = Depends(get_db), skip: int = 0, limit: int = 20):
    # It's possible for a package to be deleted, leaving an orphaned booking.
    # We must filter to only include bookings that still have a valid package_id.
    # We also need to eagerly load the related package and room data for the frontend.
    return db.query(PackageBooking).options(
        joinedload(PackageBooking.package),
        joinedload(PackageBooking.rooms).joinedload(PackageBookingRoom.room)
    ).filter(PackageBooking.package_id.is_not(None)).offset(skip).limit(limit).all()


@router.get("/", response_model=List[PackageOut])
def list_packages(db: Session = Depends(get_db), skip: int = 0, limit: int = 20):
    # Query directly in the endpoint to apply pagination
    return db.query(Package).offset(skip).limit(limit).all()


@router.get("/{package_id}", response_model=PackageOut)
def get_package_api(package_id: int, db: Session = Depends(get_db)):
    return crud_package.get_package(db, package_id)


@router.delete("/booking/{booking_id}")
def delete_package_booking_api(booking_id: Union[str, int], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Parse display ID (PK-000001) or accept numeric ID
    numeric_id, booking_type = parse_display_id(str(booking_id))
    if numeric_id is None:
        raise HTTPException(status_code=400, detail=f"Invalid booking ID format: {booking_id}")
    if booking_type and booking_type != "package":
        raise HTTPException(status_code=400, detail=f"Invalid booking type. Expected package booking, got: {booking_id}")
    booking_id = numeric_id
    
    success = crud_package.delete_package_booking(db, booking_id)
    if not success:
        raise HTTPException(status_code=404, detail="Booking not found")
    return {"deleted": success}

# ------------------- Cancel a package booking -------------------
@router.put("/booking/{booking_id}/cancel", response_model=PackageBookingOut)
def cancel_package_booking(booking_id: Union[str, int], db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Parse display ID (PK-000001) or accept numeric ID
    numeric_id, booking_type = parse_display_id(str(booking_id))
    if numeric_id is None:
        raise HTTPException(status_code=400, detail=f"Invalid booking ID format: {booking_id}")
    if booking_type and booking_type != "package":
        raise HTTPException(status_code=400, detail=f"Invalid booking type. Expected package booking, got: {booking_id}")
    booking_id = numeric_id
    
    booking = db.query(PackageBooking).filter(PackageBooking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Package booking not found")

    # Free rooms back to Available
    if booking.rooms:
        room_ids = [br.room_id for br in booking.rooms]
        db.query(Room).filter(Room.id.in_(room_ids)).update({"status": "Available"}, synchronize_session=False)

    booking.status = "cancelled"
    db.commit()
    db.refresh(booking)
    return booking

@router.put("/booking/{booking_id}/extend", response_model=PackageBookingOut)
def extend_package_booking_checkout(booking_id: Union[str, int], new_checkout: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Extend the checkout date for a package booking.
    Validates that the new checkout date is after the current checkout date
    and checks for conflicts with other bookings on the same rooms.
    Accepts both display ID (PK-000001) and numeric ID.
    """
    from datetime import datetime
    from sqlalchemy import and_, or_
    
    # Parse display ID (PK-000001) or accept numeric ID
    numeric_id, booking_type = parse_display_id(str(booking_id))
    if numeric_id is None:
        raise HTTPException(status_code=400, detail=f"Invalid booking ID format: {booking_id}")
    if booking_type and booking_type != "package":
        raise HTTPException(status_code=400, detail=f"Invalid booking type. Expected package booking, got: {booking_id}")
    booking_id = numeric_id
    
    # Parse the new checkout date string to a date object
    try:
        new_checkout_date = datetime.strptime(new_checkout, '%Y-%m-%d').date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD format")
    
    # Fetch the package booking with its rooms
    booking = db.query(PackageBooking).options(
        joinedload(PackageBooking.rooms).joinedload(PackageBookingRoom.room)
    ).filter(PackageBooking.id == booking_id).first()
    
    if not booking:
        raise HTTPException(status_code=404, detail="Package booking not found")
    
    # Check if booking is in a valid state for extension
    if booking.status not in ['booked', 'checked-in', 'checked_in']:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot extend checkout for package booking with status '{booking.status}'. Only 'booked' or 'checked-in' bookings can be extended."
        )
    
    # Validate that new checkout date is after current checkout date
    if new_checkout_date <= booking.check_out:
        raise HTTPException(
            status_code=400, 
            detail=f"New checkout date ({new_checkout_date}) must be after current checkout date ({booking.check_out})"
        )
    
    # Check for conflicts with other bookings on the same rooms
    room_ids = [br.room_id for br in booking.rooms if br.room_id]
    
    if room_ids:
        # Check for conflicts with regular bookings
        from app.models.booking import Booking, BookingRoom
        conflicting_bookings = db.query(Booking).join(BookingRoom).filter(
            BookingRoom.room_id.in_(room_ids),
            Booking.status.in_(['booked', 'checked-in', 'checked_in']),
            and_(
                Booking.check_in < new_checkout_date,
                Booking.check_out > booking.check_out
            )
        ).first()
        
        if conflicting_bookings:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot extend checkout date. Room(s) are already booked by another booking (ID: {conflicting_bookings.id}) during the extended period."
            )
        
        # Check for conflicts with other package bookings
        conflicting_package_bookings = db.query(PackageBooking).join(PackageBookingRoom).filter(
            PackageBooking.id != booking_id,
            PackageBookingRoom.room_id.in_(room_ids),
            PackageBooking.status.in_(['booked', 'checked-in', 'checked_in']),
            and_(
                PackageBooking.check_in < new_checkout_date,
                PackageBooking.check_out > booking.check_out
            )
        ).first()
        
        if conflicting_package_bookings:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot extend checkout date. Room(s) are already booked by another package booking (ID: {conflicting_package_bookings.id}) during the extended period."
            )
    
    # Update the checkout date
    booking.check_out = new_checkout_date
    db.commit()
    db.refresh(booking)
    
    # Reload booking with relationships for response
    booking_with_rooms = db.query(PackageBooking).options(
        joinedload(PackageBooking.rooms).joinedload(PackageBookingRoom.room),
        joinedload(PackageBooking.package)
    ).filter(PackageBooking.id == booking_id).first()
    
    return booking_with_rooms

@router.put("/booking/{booking_id}/check-in", response_model=PackageBookingOut)
def check_in_package_booking(
    booking_id: Union[str, int],
    id_card_image: UploadFile = File(...),
    guest_photo: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Parse display ID (PK-000001) or accept numeric ID
    numeric_id, booking_type = parse_display_id(str(booking_id))
    if numeric_id is None:
        raise HTTPException(status_code=400, detail=f"Invalid booking ID format: {booking_id}")
    if booking_type and booking_type != "package":
        raise HTTPException(status_code=400, detail=f"Invalid booking type. Expected package booking, got: {booking_id}")
    booking_id = numeric_id
    
    booking = (
        db.query(PackageBooking)
        .options(joinedload(PackageBooking.rooms).joinedload(PackageBookingRoom.room))
        .filter(PackageBooking.id == booking_id).first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Package booking not found")

    # Normalize status to be robust against case/whitespace/underscore differences
    normalized_status = (booking.status or "").strip().lower().replace("_", "-")
    # Allow check-in when:
    #  - status is 'booked' (normal case), OR
    #  - status is 'checked-out' but no check-in images were ever saved (recover-from-state issue)
    # This prevents lock-out when UI shows BOOKED but DB flipped due to earlier process.
    recoverable_checked_out = (
        normalized_status == "checked-out" and not booking.id_card_image_url and not booking.guest_photo_url
    )
    if normalized_status != "booked" and not recoverable_checked_out:
        raise HTTPException(
            status_code=400,
            detail=f"Package booking {booking_id} cannot be checked in. Expected status 'booked', found '{booking.status}'."
        )

    # Save ID card image
    id_card_filename = f"id_pkg_{booking_id}_{uuid.uuid4().hex}.jpg"
    id_card_path = os.path.join(CHECKIN_UPLOAD_DIR, id_card_filename)
    with open(id_card_path, "wb") as buffer:
        shutil.copyfileobj(id_card_image.file, buffer)
    booking.id_card_image_url = id_card_filename

    # Save guest photo
    guest_photo_filename = f"guest_pkg_{booking_id}_{uuid.uuid4().hex}.jpg"
    guest_photo_path = os.path.join(CHECKIN_UPLOAD_DIR, guest_photo_filename)
    with open(guest_photo_path, "wb") as buffer:
        shutil.copyfileobj(guest_photo.file, buffer)
    booking.guest_photo_url = guest_photo_filename

    booking.status = "checked-in"
    booking.user_id = current_user.id

    if booking.rooms:
        room_ids = [br.room_id for br in booking.rooms]
        db.query(Room).filter(Room.id.in_(room_ids)).update({"status": "Checked-in"}, synchronize_session=False)

    db.commit()
    db.refresh(booking)
    return booking

# -------------------------------
# GET check-in images for packages
# -------------------------------
@router.get("/booking/checkin-image/{filename}")
def get_package_checkin_image(filename: str):
    filepath = os.path.join(CHECKIN_UPLOAD_DIR, filename)
    if not os.path.exists(filepath) or not os.path.isfile(filepath):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(filepath)
