from sqlalchemy import Column, Integer, String, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Room(Base):
    __tablename__ = "rooms"

    id = Column(Integer, primary_key=True, index=True)
    number = Column(String, unique=True, nullable=False)
    type = Column(String)
    price = Column(Float)
    status = Column(String, default="Available")
    image_url = Column(String, nullable=True)
    adults = Column(Integer, default=2)      # max adults allowed
    children = Column(Integer, default=0)    # max children allowed
    features = Column(JSON, default=list)

    # Association (one-to-many with BookingRoom)
    booking_rooms = relationship(
        "BookingRoom",
        back_populates="room",
        cascade="all, delete-orphan"
    )

    package_booking_rooms = relationship(
        "PackageBookingRoom",
        back_populates="room",
        cascade="all, delete-orphan"
    )

    food_orders = relationship(
        "FoodOrder",
        back_populates="room"
    )


    def __repr__(self):
        return f"<Room id={self.id} number={self.number} status={self.status}>"
