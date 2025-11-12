from pydantic import BaseModel

class RoomBase(BaseModel):
    number: str
    type: str
    price: float
    adults: int = 2      # new field
    children: int = 0    # new field
    features: list[str] = []

class RoomCreate(RoomBase):
    pass

class RoomOut(RoomBase):
    id: int
    status: str
    image_url: str | None = None

    model_config = {
        "from_attributes": True  # enables from_orm in Pydantic v2
    }
