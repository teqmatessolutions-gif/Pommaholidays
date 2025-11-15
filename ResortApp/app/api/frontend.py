from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
import os
import shutil
import uuid

import app.schemas.frontend as schemas
import app.models.frontend as models
from app.models.user import User
import app.curd.frontend as crud
from app.utils.auth import get_db, get_current_user

router = APIRouter()

# Determine upload directory - use absolute path to avoid issues with working directory
# Get the directory where main.py is located (ResortApp/)
# frontend.py is at: ResortApp/app/api/frontend.py
# So we need to go up 3 levels: app/api -> app -> ResortApp
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOAD_DIR = os.path.join(BASE_DIR, "static", "uploads")
# Ensure directory exists with proper permissions
os.makedirs(UPLOAD_DIR, exist_ok=True)
print(f"Upload directory set to: {UPLOAD_DIR}")  # Debug log

# ---------- Header & Banner ----------
@router.get("/header-banner/", response_model=list[schemas.HeaderBanner])
@router.get("/header-banner", response_model=list[schemas.HeaderBanner])  # Accept both with and without trailing slash
def list_header_banner(db: Session = Depends(get_db), skip: int = 0, limit: int = 20):
    return crud.get_all(db, models.HeaderBanner, skip=skip, limit=limit)


# ✅ Create header banner
@router.post("/header-banner/", response_model=schemas.HeaderBanner)
async def create_header_banner(
    title: str = Form(...),
    subtitle: str = Form(...),
    is_active: str = Form("true"),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Convert is_active string to boolean
        is_active_bool = is_active.lower() in ("true", "1", "yes", "on")
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        # Check if directory is writable
        if not os.access(UPLOAD_DIR, os.W_OK):
            raise HTTPException(status_code=500, detail=f"Upload directory is not writable: {UPLOAD_DIR}")
        
        # Generate unique filename to avoid conflicts
        if not image.filename:
            raise HTTPException(status_code=400, detail="No filename provided for image")
        
        file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
        unique_filename = f"banner_{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        # Verify file was saved
        if not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="File was not saved successfully")

        # Create URL path (relative to static mount)
        # static/uploads/banner_xxx.jpg -> /static/uploads/banner_xxx.jpg
        normalized_path = file_path.replace('\\', '/')
        # Extract relative path from BASE_DIR
        if normalized_path.startswith(BASE_DIR.replace('\\', '/')):
            image_url = normalized_path.replace(BASE_DIR.replace('\\', '/'), '').lstrip('/')
        else:
            image_url = normalized_path.lstrip('/')
        
        if not image_url.startswith('static/'):
            image_url = f"static/uploads/{unique_filename}"
        
        image_url = f"/{image_url}" if not image_url.startswith('/') else image_url
        
        obj = schemas.HeaderBannerCreate(
            title=title,
            subtitle=subtitle,
            is_active=is_active_bool,
            image_url=image_url
        )
        return crud.create(db, models.HeaderBanner, obj)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to create header banner: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")  # Log to console for debugging
        raise HTTPException(status_code=500, detail=f"Failed to create header banner: {str(e)}")


# ✅ Update header banner
@router.put("/header-banner/{item_id}", response_model=schemas.HeaderBanner)
async def update_header_banner(
    item_id: int,
    title: str = Form(...),
    subtitle: str = Form(...),
    is_active: str = Form("true"),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        # Convert is_active string to boolean
        is_active_bool = is_active.lower() in ("true", "1", "yes", "on")
        
        image_url = None
        if image:
            # Ensure upload directory exists
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            
            # Check if directory is writable
            if not os.access(UPLOAD_DIR, os.W_OK):
                raise HTTPException(status_code=500, detail=f"Upload directory is not writable: {UPLOAD_DIR}")
            
            # Generate unique filename to avoid conflicts
            if not image.filename:
                raise HTTPException(status_code=400, detail="No filename provided for image")
            
            file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
            unique_filename = f"banner_{uuid.uuid4().hex}.{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            # Verify file was saved
            if not os.path.exists(file_path):
                raise HTTPException(status_code=500, detail="File was not saved successfully")
            
            # Create URL path (relative to static mount)
            normalized_path = file_path.replace('\\', '/')
            if normalized_path.startswith(BASE_DIR.replace('\\', '/')):
                image_url = normalized_path.replace(BASE_DIR.replace('\\', '/'), '').lstrip('/')
            else:
                image_url = normalized_path.lstrip('/')
            
            if not image_url.startswith('static/'):
                image_url = f"static/uploads/{unique_filename}"
            
            image_url = f"/{image_url}" if not image_url.startswith('/') else image_url

        obj = schemas.HeaderBannerUpdate(
            title=title,
            subtitle=subtitle,
            is_active=is_active_bool,
            image_url=image_url
        )
        return crud.update(db, models.HeaderBanner, item_id, obj)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update header banner: {str(e)}")


# ✅ Delete header banner
@router.delete("/header-banner/{item_id}")
def delete_header_banner(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.HeaderBanner, item_id)

# ---------- Check Availability ----------
@router.get("/check-availability/", response_model=list[schemas.CheckAvailability])
def list_check_availability(db: Session = Depends(get_db), skip: int = 0, limit: int = 20):
    return crud.get_all(db, models.CheckAvailability, skip=skip, limit=limit)


@router.post("/check-availability/", response_model=schemas.CheckAvailability)
def create_check_availability(obj: schemas.CheckAvailabilityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.create(db, models.CheckAvailability, obj)


@router.put("/check-availability/{item_id}", response_model=schemas.CheckAvailability)
def update_check_availability(item_id: int, obj: schemas.CheckAvailabilityCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.update(db, models.CheckAvailability, item_id, obj)


@router.delete("/check-availability/{item_id}")
def delete_check_availability(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.CheckAvailability, item_id)


# ---------- Gallery ----------
@router.get("/gallery/", response_model=list[schemas.Gallery])
@router.get("/gallery", response_model=list[schemas.Gallery])  # Accept both with and without trailing slash
def list_gallery(db: Session = Depends(get_db), skip: int = 0, limit: int = 20):
    return crud.get_all(db, models.Gallery, skip=skip, limit=limit)


@router.post("/gallery/", response_model=schemas.Gallery)
async def create_gallery(
    caption: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        if not os.access(UPLOAD_DIR, os.W_OK):
            raise HTTPException(status_code=500, detail=f"Upload directory is not writable: {UPLOAD_DIR}")
        if not image.filename:
            raise HTTPException(status_code=400, detail="No filename provided for image")
        
        # Generate unique filename to avoid conflicts
        file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
        unique_filename = f"gallery_{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="File was not saved successfully")

        # Create URL path (relative to static mount)
        normalized_path = file_path.replace('\\', '/')
        if normalized_path.startswith(BASE_DIR.replace('\\', '/')):
            image_url = normalized_path.replace(BASE_DIR.replace('\\', '/'), '').lstrip('/')
        else:
            image_url = normalized_path.lstrip('/')
        
        if not image_url.startswith('static/'):
            image_url = f"static/uploads/{unique_filename}"
        
        image_url = f"/{image_url}" if not image_url.startswith('/') else image_url
        
        obj = schemas.GalleryCreate(
            caption=caption,
            is_active=is_active,
            image_url=image_url
        )
        return crud.create(db, models.Gallery, obj)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to create gallery image: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Failed to create gallery image: {str(e)}")


@router.put("/gallery/{item_id}", response_model=schemas.Gallery)
async def update_gallery(
    item_id: int,
    caption: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        image_url = None
        if image:
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            if not os.access(UPLOAD_DIR, os.W_OK):
                raise HTTPException(status_code=500, detail=f"Upload directory is not writable: {UPLOAD_DIR}")
            if not image.filename:
                raise HTTPException(status_code=400, detail="No filename provided for image")
            
            # Generate unique filename to avoid conflicts
            file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
            unique_filename = f"gallery_{uuid.uuid4().hex}.{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            if not os.path.exists(file_path):
                raise HTTPException(status_code=500, detail="File was not saved successfully")

            # Create URL path (relative to static mount)
            normalized_path = file_path.replace('\\', '/')
            if normalized_path.startswith(BASE_DIR.replace('\\', '/')):
                image_url = normalized_path.replace(BASE_DIR.replace('\\', '/'), '').lstrip('/')
            else:
                image_url = normalized_path.lstrip('/')
            
            if not image_url.startswith('static/'):
                image_url = f"static/uploads/{unique_filename}"
            
            image_url = f"/{image_url}" if not image_url.startswith('/') else image_url

        # If no new image provided, keep existing image_url
        if image_url is None:
            existing = crud.get_by_id(db, models.Gallery, item_id)
            if existing:
                image_url = existing.image_url

        obj = schemas.GalleryCreate(
            caption=caption,
            is_active=is_active,
            image_url=image_url
        )
        return crud.update(db, models.Gallery, item_id, obj)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to update gallery image: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Failed to update gallery image: {str(e)}")


@router.delete("/gallery/{item_id}")
def delete_gallery(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.Gallery, item_id)


# ---------- Reviews ----------
@router.get("/reviews/", response_model=list[schemas.Review])
@router.get("/reviews", response_model=list[schemas.Review])  # Accept both with and without trailing slash
def list_reviews(db: Session = Depends(get_db), skip: int = 0, limit: int = 20):
    return crud.get_all(db, models.Review, skip=skip, limit=limit)


@router.post("/reviews/", response_model=schemas.Review)
def create_review(obj: schemas.ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # Ensure rating is an integer
        if isinstance(obj.rating, str):
            obj.rating = int(obj.rating)
        return crud.create(db, models.Review, obj)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to create review: {str(e)}")


@router.put("/reviews/{item_id}", response_model=schemas.Review)
def update_review(item_id: int, obj: schemas.ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        # Ensure rating is an integer
        if isinstance(obj.rating, str):
            obj.rating = int(obj.rating)
        return crud.update(db, models.Review, item_id, obj)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to update review: {str(e)}")


@router.delete("/reviews/{item_id}")
def delete_review(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.Review, item_id)


# ---------- Resort Info ----------
@router.get("/resort-info/", response_model=list[schemas.ResortInfo])
@router.get("/resort-info", response_model=list[schemas.ResortInfo])  # Accept both with and without trailing slash
def list_resort_info(db: Session = Depends(get_db), skip: int = 0, limit: int = 1000):
    # Return all resort info ordered by ID
    return db.query(models.ResortInfo).order_by(models.ResortInfo.id).offset(skip).limit(limit).all()


@router.post("/resort-info/", response_model=schemas.ResortInfo)
def create_resort_info(
    obj: schemas.ResortInfoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.create(db, models.ResortInfo, obj)


@router.put("/resort-info/{item_id}", response_model=schemas.ResortInfo)
def update_resort_info(
    item_id: int,
    obj: schemas.ResortInfoCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud.update(db, models.ResortInfo, item_id, obj)


@router.delete("/resort-info/{item_id}")
def delete_resort_info(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.ResortInfo, item_id)


# ---------- Signature Experiences ----------
@router.get("/signature-experiences/", response_model=list[schemas.SignatureExperience])
@router.get("/signature-experiences", response_model=list[schemas.SignatureExperience])  # Accept both with and without trailing slash
def list_signature_experiences(db: Session = Depends(get_db), skip: int = 0, limit: int = 1000):
    # Return all signature experiences ordered by ID
    return db.query(models.SignatureExperience).order_by(models.SignatureExperience.id).offset(skip).limit(limit).all()


@router.post("/signature-experiences/", response_model=schemas.SignatureExperience)
async def create_signature_experience(
    title: str = Form(...),
    description: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        if not os.access(UPLOAD_DIR, os.W_OK):
            raise HTTPException(status_code=500, detail=f"Upload directory is not writable: {UPLOAD_DIR}")
        if not image.filename:
            raise HTTPException(status_code=400, detail="No filename provided for image")
        
        # Generate unique filename to avoid conflicts
        file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
        unique_filename = f"sigexp_{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="File was not saved successfully")

        # Create URL path (relative to static mount)
        normalized_path = file_path.replace('\\', '/')
        if normalized_path.startswith(BASE_DIR.replace('\\', '/')):
            image_url = normalized_path.replace(BASE_DIR.replace('\\', '/'), '').lstrip('/')
        else:
            image_url = normalized_path.lstrip('/')
        
        if not image_url.startswith('static/'):
            image_url = f"static/uploads/{unique_filename}"
        
        image_url = f"/{image_url}" if not image_url.startswith('/') else image_url
        
        obj = schemas.SignatureExperienceCreate(
            title=title,
            description=description,
            is_active=is_active,
            image_url=image_url
        )
        return crud.create(db, models.SignatureExperience, obj)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to create signature experience: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Failed to create signature experience: {str(e)}")


@router.put("/signature-experiences/{item_id}", response_model=schemas.SignatureExperience)
async def update_signature_experience(
    item_id: int,
    title: str = Form(...),
    description: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        update_data = {
            "title": title,
            "description": description,
            "is_active": is_active,
        }
        
        if image:
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            if not os.access(UPLOAD_DIR, os.W_OK):
                raise HTTPException(status_code=500, detail=f"Upload directory is not writable: {UPLOAD_DIR}")
            if not image.filename:
                raise HTTPException(status_code=400, detail="No filename provided for image")
            
            # Generate unique filename to avoid conflicts
            file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
            unique_filename = f"sigexp_{uuid.uuid4().hex}.{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            if not os.path.exists(file_path):
                raise HTTPException(status_code=500, detail="File was not saved successfully")

            # Create URL path (relative to static mount)
            normalized_path = file_path.replace('\\', '/')
            if normalized_path.startswith(BASE_DIR.replace('\\', '/')):
                image_url = normalized_path.replace(BASE_DIR.replace('\\', '/'), '').lstrip('/')
            else:
                image_url = normalized_path.lstrip('/')
            
            if not image_url.startswith('static/'):
                image_url = f"static/uploads/{unique_filename}"
            
            image_url = f"/{image_url}" if not image_url.startswith('/') else image_url
            update_data["image_url"] = image_url
        else:
            # If no new image provided, keep existing image_url
            existing = crud.get_by_id(db, models.SignatureExperience, item_id)
            if existing:
                update_data["image_url"] = existing.image_url

        obj = schemas.SignatureExperienceUpdate(**update_data)
        return crud.update(db, models.SignatureExperience, item_id, obj)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to update signature experience: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Failed to update signature experience: {str(e)}")


@router.delete("/signature-experiences/{item_id}")
def delete_signature_experience(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.SignatureExperience, item_id)


# ---------- Plan Your Wedding ----------
@router.get("/plan-weddings/", response_model=list[schemas.PlanWedding])
@router.get("/plan-weddings", response_model=list[schemas.PlanWedding])  # Accept both with and without trailing slash
def list_plan_weddings(db: Session = Depends(get_db), skip: int = 0, limit: int = 1000):
    try:
        # Return all wedding banners ordered by ID
        return db.query(models.PlanWedding).order_by(models.PlanWedding.id).offset(skip).limit(limit).all()
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error listing plan weddings: {str(e)}")
        print(f"Traceback: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Failed to list plan weddings: {str(e)}")


@router.post("/plan-weddings/", response_model=schemas.PlanWedding)
async def create_plan_wedding(
    title: str = Form(...),
    description: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        if not os.access(UPLOAD_DIR, os.W_OK):
            raise HTTPException(status_code=500, detail=f"Upload directory is not writable: {UPLOAD_DIR}")
        if not image.filename:
            raise HTTPException(status_code=400, detail="No filename provided for image")
        
        # Generate unique filename to avoid conflicts
        file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
        unique_filename = f"wedding_{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="File was not saved successfully")

        # Create URL path (relative to static mount)
        normalized_path = file_path.replace('\\', '/')
        if normalized_path.startswith(BASE_DIR.replace('\\', '/')):
            image_url = normalized_path.replace(BASE_DIR.replace('\\', '/'), '').lstrip('/')
        else:
            image_url = normalized_path.lstrip('/')
        
        if not image_url.startswith('static/'):
            image_url = f"static/uploads/{unique_filename}"
        
        image_url = f"/{image_url}" if not image_url.startswith('/') else image_url
        
        obj = schemas.PlanWeddingCreate(
            title=title,
            description=description,
            is_active=is_active,
            image_url=image_url
        )
        return crud.create(db, models.PlanWedding, obj)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to create plan wedding: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Failed to create plan wedding: {str(e)}")


@router.put("/plan-weddings/{item_id}", response_model=schemas.PlanWedding)
async def update_plan_wedding(
    item_id: int,
    title: str = Form(...),
    description: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        update_data = {
            "title": title,
            "description": description,
            "is_active": is_active,
        }
        
        if image:
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            if not os.access(UPLOAD_DIR, os.W_OK):
                raise HTTPException(status_code=500, detail=f"Upload directory is not writable: {UPLOAD_DIR}")
            if not image.filename:
                raise HTTPException(status_code=400, detail="No filename provided for image")
            
            # Generate unique filename to avoid conflicts
            file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
            unique_filename = f"wedding_{uuid.uuid4().hex}.{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            if not os.path.exists(file_path):
                raise HTTPException(status_code=500, detail="File was not saved successfully")

            # Create URL path (relative to static mount)
            normalized_path = file_path.replace('\\', '/')
            if normalized_path.startswith(BASE_DIR.replace('\\', '/')):
                image_url = normalized_path.replace(BASE_DIR.replace('\\', '/'), '').lstrip('/')
            else:
                image_url = normalized_path.lstrip('/')
            
            if not image_url.startswith('static/'):
                image_url = f"static/uploads/{unique_filename}"
            
            image_url = f"/{image_url}" if not image_url.startswith('/') else image_url
            update_data["image_url"] = image_url
        else:
            # If no new image provided, keep existing image_url
            existing = crud.get_by_id(db, models.PlanWedding, item_id)
            if existing:
                update_data["image_url"] = existing.image_url

        obj = schemas.PlanWeddingUpdate(**update_data)
        return crud.update(db, models.PlanWedding, item_id, obj)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to update plan wedding: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Failed to update plan wedding: {str(e)}")


@router.delete("/plan-weddings/{item_id}")
def delete_plan_wedding(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.PlanWedding, item_id)


# ---------- Nearby Attractions ----------
@router.get("/nearby-attractions/", response_model=list[schemas.NearbyAttraction])
@router.get("/nearby-attractions", response_model=list[schemas.NearbyAttraction])  # Accept both with and without trailing slash
def list_nearby_attractions(db: Session = Depends(get_db), skip: int = 0, limit: int = 1000):
    # Return all active attractions ordered by ID
    return db.query(models.NearbyAttraction).order_by(models.NearbyAttraction.id).offset(skip).limit(limit).all()


@router.post("/nearby-attractions/", response_model=schemas.NearbyAttraction)
async def create_nearby_attraction(
    title: str = Form(...),
    description: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        if not os.access(UPLOAD_DIR, os.W_OK):
            raise HTTPException(status_code=500, detail=f"Upload directory is not writable: {UPLOAD_DIR}")
        if not image.filename:
            raise HTTPException(status_code=400, detail="No filename provided for image")
        
        # Generate unique filename to avoid conflicts
        file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
        unique_filename = f"attraction_{uuid.uuid4().hex}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=500, detail="File was not saved successfully")

        # Create URL path (relative to static mount)
        normalized_path = file_path.replace('\\', '/')
        if normalized_path.startswith(BASE_DIR.replace('\\', '/')):
            image_url = normalized_path.replace(BASE_DIR.replace('\\', '/'), '').lstrip('/')
        else:
            image_url = normalized_path.lstrip('/')
        
        if not image_url.startswith('static/'):
            image_url = f"static/uploads/{unique_filename}"
        
        image_url = f"/{image_url}" if not image_url.startswith('/') else image_url
        
        obj = schemas.NearbyAttractionCreate(
            title=title,
            description=description,
            is_active=is_active,
            image_url=image_url
        )
        return crud.create(db, models.NearbyAttraction, obj)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to create nearby attraction: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Failed to create nearby attraction: {str(e)}")


@router.put("/nearby-attractions/{item_id}", response_model=schemas.NearbyAttraction)
async def update_nearby_attraction(
    item_id: int,
    title: str = Form(...),
    description: str = Form(...),
    is_active: bool = Form(True),
    image: UploadFile = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        update_data = {
            "title": title,
            "description": description,
            "is_active": is_active,
        }
        
        if image:
            os.makedirs(UPLOAD_DIR, exist_ok=True)
            if not os.access(UPLOAD_DIR, os.W_OK):
                raise HTTPException(status_code=500, detail=f"Upload directory is not writable: {UPLOAD_DIR}")
            if not image.filename:
                raise HTTPException(status_code=400, detail="No filename provided for image")
            
            # Generate unique filename to avoid conflicts
            file_ext = image.filename.split('.')[-1] if '.' in image.filename else 'jpg'
            unique_filename = f"attraction_{uuid.uuid4().hex}.{file_ext}"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(image.file, buffer)
            
            if not os.path.exists(file_path):
                raise HTTPException(status_code=500, detail="File was not saved successfully")

            # Create URL path (relative to static mount)
            normalized_path = file_path.replace('\\', '/')
            if normalized_path.startswith(BASE_DIR.replace('\\', '/')):
                image_url = normalized_path.replace(BASE_DIR.replace('\\', '/'), '').lstrip('/')
            else:
                image_url = normalized_path.lstrip('/')
            
            if not image_url.startswith('static/'):
                image_url = f"static/uploads/{unique_filename}"
            
            image_url = f"/{image_url}" if not image_url.startswith('/') else image_url
            update_data["image_url"] = image_url
        else:
            # If no new image provided, keep existing image_url
            existing = crud.get_by_id(db, models.NearbyAttraction, item_id)
            if existing:
                update_data["image_url"] = existing.image_url

        obj = schemas.NearbyAttractionUpdate(**update_data)
        return crud.update(db, models.NearbyAttraction, item_id, obj)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_detail = f"Failed to update nearby attraction: {str(e)}\n{traceback.format_exc()}"
        print(f"ERROR: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Failed to update nearby attraction: {str(e)}")


@router.delete("/nearby-attractions/{item_id}")
def delete_nearby_attraction(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return crud.delete(db, models.NearbyAttraction, item_id)


# ---------- Nearby Attraction Banners ----------
# Support both singular and plural forms to avoid 404 errors
@router.get("/nearby-attraction-banner/", response_model=list[schemas.NearbyAttractionBanner])
@router.get("/nearby-attraction-banner", response_model=list[schemas.NearbyAttractionBanner])  # Accept both with and without trailing slash
@router.get("/nearby-attraction-banners/", response_model=list[schemas.NearbyAttractionBanner])  # Plural form
@router.get("/nearby-attraction-banners", response_model=list[schemas.NearbyAttractionBanner])  # Plural form without trailing slash
def list_nearby_attraction_banner(db: Session = Depends(get_db), skip: int = 0, limit: int = 1000):
    # Return all active banners ordered by ID
    return db.query(models.NearbyAttractionBanner).filter(models.NearbyAttractionBanner.is_active == True).order_by(models.NearbyAttractionBanner.id).offset(skip).limit(limit).all()