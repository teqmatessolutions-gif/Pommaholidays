from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.curd import expenses as expense_crud
from app.utils.auth import get_db, get_current_user
from app.schemas.expenses import ExpenseOut
from app.models.user import User
from app.models.employee import Employee
import os
import shutil
from fastapi.responses import FileResponse
import uuid

router = APIRouter(prefix="/expenses", tags=["Expenses"])

UPLOAD_DIR = "uploads/expenses"


# Use route without trailing slash to avoid redirects on POST requests
@router.post("", response_model=ExpenseOut)
async def create_expense(
    category: str = Form(...),
    amount: float = Form(...),
    date: str = Form(...),
    description: str = Form(None),
    employee_id: int = Form(...),
    image: UploadFile = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        # Validate employee exists
        employee = db.query(Employee).filter(Employee.id == employee_id).first()
        if not employee:
            raise HTTPException(status_code=400, detail=f"Employee with ID {employee_id} not found")
        
        # Ensure upload directory exists
        os.makedirs(UPLOAD_DIR, exist_ok=True)
        
        image_path = None
        if image and image.filename:
            try:
                # Safe filename using UUID
                safe_filename = image.filename.replace(" ", "_")
                filename = f"{employee_id}_{uuid.uuid4().hex}_{safe_filename}"
                file_location = os.path.join(UPLOAD_DIR, filename)
                
                # Save the file
                with open(file_location, "wb") as buffer:
                    shutil.copyfileobj(image.file, buffer)
                
                # Path to be used by frontend (relative to /uploads/)
                image_path = f"uploads/expenses/{filename}"
            except Exception as e:
                import traceback
                error_trace = traceback.format_exc()
                print(f"Error saving expense image: {str(e)}")
                print(f"Traceback: {error_trace}")
                raise HTTPException(status_code=500, detail=f"Failed to save image: {str(e)}")

        # Store expense in DB using ExpenseCreate schema
        from app.schemas.expenses import ExpenseCreate
        from datetime import datetime
        
        try:
            expense_date = datetime.strptime(date, "%Y-%m-%d").date() if isinstance(date, str) else date
        except ValueError as e:
            raise HTTPException(status_code=400, detail=f"Invalid date format. Expected YYYY-MM-DD, got: {date}")
        
        expense_data = ExpenseCreate(
            category=category,
            amount=amount,
            date=expense_date,
            description=description,
            employee_id=employee_id,
        )

        created = expense_crud.create_expense(db, data=expense_data, image_path=image_path)

        # Add employee name in the response
        return {
            **created.__dict__,
            "employee_name": employee.name if employee else "N/A"
        }
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error creating expense: {str(e)}")
        print(f"Traceback: {error_trace}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create expense: {str(e)}")

# Handle both with and without trailing slash to avoid redirects
@router.get("", response_model=list[ExpenseOut])
@router.get("/", response_model=list[ExpenseOut])
def get_expenses(db: Session = Depends(get_db), skip: int = 0, limit: int = 20):
    expenses = expense_crud.get_all_expenses(db, skip=skip, limit=limit)
    result = []
    for exp in expenses:
        emp = db.query(Employee).filter(Employee.id == exp.employee_id).first()
        result.append({
            **exp.__dict__,
            "employee_name": emp.name if emp else "N/A"
        })
    return result

@router.get("/image/{filename}")
def get_expense_image(filename: str):
    filepath = os.path.join(UPLOAD_DIR, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(filepath)
