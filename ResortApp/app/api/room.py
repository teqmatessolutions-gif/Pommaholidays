from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import SessionLocal
from app.schemas.room import RoomCreate, RoomOut
from app.curd import room as crud_room
from app.models.room import Room
from app.models.booking import Booking, BookingRoom
import shutil
import os
import json
from uuid import uuid4
from datetime import date

router = APIRouter(prefix="/rooms", tags=["Rooms"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

UPLOAD_DIR = os.path.join("static", "rooms")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# Test endpoint without authentication - handles images
@router.post("/test", response_model=RoomOut)
def create_room_test(
    number: str = Form(...),
    type: str = Form(...),
    price: float = Form(...),
    status: str = Form("Available"),
    adults: int = Form(2),
    children: int = Form(0),
    features: str = Form("[]"),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    try:
        filename = None
        if image and image.filename:
            try:
                ext = image.filename.split('.')[-1]
                filename = f"room_{uuid4().hex}.{ext}"
                image_path = os.path.join(UPLOAD_DIR, filename)
                with open(image_path, "wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)
            except Exception as e:
                print(f"Error saving image: {e}")
                raise HTTPException(status_code=500, detail=f"Error saving image: {str(e)}")

        try:
            parsed_features = json.loads(features) if features else []
            if not isinstance(parsed_features, list):
                raise ValueError("Features must be a list")
            parsed_features = [str(item) for item in parsed_features]
        except (ValueError, json.JSONDecodeError) as parse_error:
            raise HTTPException(status_code=400, detail=f"Invalid features format: {parse_error}")

        db_room = Room(
            number=number,
            type=type,
            price=price,
            status=status,
            adults=adults,
            children=children,
            image_url=f"/static/rooms/{filename}" if filename else None,
            features=parsed_features
        )
        db.add(db_room)
        db.commit()
        db.refresh(db_room)
        return db_room
    except Exception as e:
        db.rollback()
        print(f"Error creating room: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating room: {str(e)}")


# Test endpoint to check if the router is working
@router.get("/test-simple")
def test_simple():
    return {"message": "Room router is working"}

# Test delete endpoint
@router.delete("/test/{room_id}")
def delete_room_test(room_id: int, db: Session = Depends(get_db)):
    try:
        db_room = db.query(Room).filter(Room.id == room_id).first()
        if db_room is None:
            raise HTTPException(status_code=404, detail="Room not found")

        # Delete associated image if exists
        if db_room.image_url:
            image_path = db_room.image_url.lstrip("/")
            if os.path.exists(image_path):
                os.remove(image_path)

        db.delete(db_room)
        db.commit()
        return {"message": "Room deleted successfully"}
    except Exception as e:
        db.rollback()
        print(f"Error deleting room: {e}")
        raise HTTPException(status_code=500, detail=f"Error deleting room: {str(e)}")

# Test GET endpoint for fetching rooms
@router.get("/test", response_model=list[RoomOut])
def get_rooms_test(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    try:
        # Update room statuses before fetching (non-blocking - continues even if update fails)
        try:
            from app.utils.room_status import update_room_statuses
            update_room_statuses(db)
        except Exception as status_error:
            print(f"Room status update failed (continuing): {status_error}")
            # Continue fetching rooms even if status update fails
        
        rooms = db.query(Room).offset(skip).limit(limit).all()
        return rooms
        
    except Exception as e:
        print(f"Error fetching rooms: {e}")
        print(f"Error type: {type(e)}")
        
        # Try to rollback any pending transaction
        try:
            db.rollback()
        except Exception as rollback_error:
            print(f"Rollback error: {rollback_error}")
        
        raise HTTPException(status_code=500, detail=f"Error fetching rooms: {str(e)}")

# ---------------- CREATE ----------------
@router.post("/", response_model=RoomOut)
def create_room(
    number: str = Form(...),
    type: str = Form(...),
    price: float = Form(...),
    status: str = Form("Available"),
    adults: int = Form(2),
    children: int = Form(0),
    features: str = Form("[]"),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    try:
        filename = None
        if image and image.filename:
            try:
                ext = image.filename.split('.')[-1]
                filename = f"room_{uuid4().hex}.{ext}"
                image_path = os.path.join(UPLOAD_DIR, filename)
                with open(image_path, "wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)
            except Exception as e:
                print(f"Error saving image: {e}")
                raise HTTPException(status_code=500, detail=f"Error saving image: {str(e)}")

        try:
            parsed_features = json.loads(features) if features else []
            if not isinstance(parsed_features, list):
                raise ValueError("Features must be a list")
            parsed_features = [str(item) for item in parsed_features]
        except (ValueError, json.JSONDecodeError) as parse_error:
            raise HTTPException(status_code=400, detail=f"Invalid features format: {parse_error}")

        db_room = Room(
            number=number,
            type=type,
            price=price,
            status=status,
            adults=adults,
            children=children,
            image_url=f"/static/rooms/{filename}" if filename else None,
            features=parsed_features
        )
        db.add(db_room)
        db.commit()
        db.refresh(db_room)
        return db_room
    except Exception as e:
        db.rollback()
        print(f"Error creating room: {e}")
        raise HTTPException(status_code=500, detail=f"Error creating room: {str(e)}")


# ---------------- READ ----------------
@router.post("/update-statuses")
def update_room_statuses_endpoint(db: Session = Depends(get_db)):
    """
    Manually trigger room status update based on current bookings.
    This endpoint can be called to refresh room statuses.
    """
    try:
        from app.utils.room_status import update_room_statuses
        update_room_statuses(db)
        return {"message": "Room statuses updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating room statuses: {str(e)}")

@router.get("/", response_model=list[RoomOut])
def get_rooms(db: Session = Depends(get_db), skip: int = 0, limit: int = 20):
    try:
        # Test database connection first
        try:
            db.execute(text("SELECT 1"))
        except Exception as conn_error:
            print(f"Database connection test failed: {conn_error}")
            raise HTTPException(status_code=503, detail="Database connection unavailable. Please try again.")
        
        # Update room statuses before fetching (non-blocking - continues even if update fails)
        try:
            from app.utils.room_status import update_room_statuses
            update_room_statuses(db)
        except Exception as status_error:
            print(f"Room status update failed (continuing): {status_error}")
            # Continue fetching rooms even if status update fails
        
        # Query rooms with proper error handling
        try:
            rooms = db.query(Room).offset(skip).limit(limit).all()
        except Exception as query_error:
            print(f"Room query failed: {query_error}")
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Error querying rooms: {str(query_error)}")
        
        # Return the rooms directly - SQLAlchemy should handle serialization
        return rooms
        
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except Exception as e:
        print(f"Error fetching rooms: {e}")
        print(f"Error type: {type(e)}")
        
        # Try to rollback any pending transaction
        try:
            db.rollback()
        except Exception as rollback_error:
            print(f"Rollback error: {rollback_error}")
        
        raise HTTPException(status_code=500, detail=f"Error fetching rooms: {str(e)}")


# ---------------- DELETE ----------------
@router.delete("/{room_id}")
def delete_room(room_id: int, db: Session = Depends(get_db)):
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if db_room is None:
        raise HTTPException(status_code=404, detail="Room not found")

    # Delete associated image if exists
    if db_room.image_url:
        image_path = db_room.image_url.lstrip("/")
        if os.path.exists(image_path):
            os.remove(image_path)

    db.delete(db_room)
    db.commit()
    return {"message": "Room deleted successfully"}


# ---------------- UPDATE ----------------
@router.put("/{room_id}", response_model=RoomOut)
def update_room(
    room_id: int,
    number: str = Form(None),
    type: str = Form(None),
    price: float = Form(None),
    status: str = Form(None),
    adults: int = Form(None),
    children: int = Form(None),
    features: str = Form(None),
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    db_room = db.query(Room).filter(Room.id == room_id).first()
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")

    # Update fields if provided
    if number:
        db_room.number = number
    if type:
        db_room.type = type
    if price is not None:
        db_room.price = price
    if status:
        db_room.status = status
    if adults is not None:
        db_room.adults = adults
    if children is not None:
        db_room.children = children
    if features is not None:
        try:
            parsed_features = json.loads(features) if features else []
            if not isinstance(parsed_features, list):
                raise ValueError("Features must be a list")
            parsed_features = [str(item) for item in parsed_features]
        except (ValueError, json.JSONDecodeError) as parse_error:
            raise HTTPException(status_code=400, detail=f"Invalid features format: {parse_error}")
        db_room.features = parsed_features

    # Handle new image upload if provided
    if image:
        # Remove old image if exists
        if db_room.image_url:
            old_path = db_room.image_url.lstrip("/")
            if os.path.exists(old_path):
                os.remove(old_path)

        ext = image.filename.split(".")[-1]
        filename = f"room_{uuid4().hex}.{ext}"
        image_path = os.path.join(UPLOAD_DIR, filename)
        with open(image_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        db_room.image_url = f"/static/rooms/{filename}"

    db.commit()
    db.refresh(db_room)
    return db_room
