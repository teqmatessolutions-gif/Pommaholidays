from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.foodorder import FoodOrderCreate, FoodOrderOut, FoodOrderUpdate
from app.curd import foodorder as crud  # ✅ Correct import
from app.utils.auth import get_db, get_current_user
from app.models.user import User
from typing import List

router = APIRouter(prefix="/food-orders", tags=["Food Orders"])

# Use route without trailing slash to avoid redirects on POST requests
@router.post("", response_model=FoodOrderOut)
def create_order(order: FoodOrderCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        return crud.create_food_order(db, order)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error creating food order: {str(e)}")
        print(f"Traceback: {error_trace}")
        raise HTTPException(status_code=500, detail=f"Failed to create food order: {str(e)}")

@router.get("", response_model=List[FoodOrderOut])
def get_orders(db: Session = Depends(get_db), skip: int = 0, limit: int = 20):
    return crud.get_food_orders(db, skip=skip, limit=limit)

@router.delete("/{order_id}")
def delete_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted = crud.delete_food_order(db, order_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Deleted successfully"}

@router.patch("/{order_id}/cancel")
def cancel_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = crud.update_food_order_status(db, order_id, status="cancelled")
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return {"message": "Order cancelled"}

@router.put("/{order_id}", response_model=FoodOrderOut)
def update_order(order_id: int, order_update: FoodOrderUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    updated = crud.update_food_order(db, order_id, order_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Order not found")
    return updated
