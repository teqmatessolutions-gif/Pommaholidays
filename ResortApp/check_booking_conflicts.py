#!/usr/bin/env python3
"""
Script to identify booking conflicts in the database.
A conflict occurs when the same room is booked for overlapping dates.
"""

import sys
from sqlalchemy import create_engine, and_, or_
from sqlalchemy.orm import sessionmaker
from datetime import date

# Import models
sys.path.append('.')
from app.models.booking import Booking, BookingRoom
from app.models.Package import PackageBooking, PackageBookingRoom
from app.models.room import Room
from app.database import SQLALCHEMY_DATABASE_URL

def check_conflicts():
    """Check for booking conflicts and report them."""
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    conflicts = []
    
    try:
        # Get all active bookings (regular and package)
        regular_bookings = db.query(Booking).filter(
            Booking.status.in_(['booked', 'checked-in', 'checked_in'])
        ).all()
        
        package_bookings = db.query(PackageBooking).filter(
            PackageBooking.status.in_(['booked', 'checked-in', 'checked_in'])
        ).all()
        
        # Check regular bookings against each other
        for i, booking1 in enumerate(regular_bookings):
            for booking2 in regular_bookings[i+1:]:
                # Get rooms for each booking
                rooms1 = [br.room_id for br in booking1.booking_rooms]
                rooms2 = [br.room_id for br in booking2.booking_rooms]
                
                # Check for overlapping rooms
                common_rooms = set(rooms1) & set(rooms2)
                if common_rooms:
                    # Check for date overlap
                    if booking1.check_in < booking2.check_out and booking1.check_out > booking2.check_in:
                        for room_id in common_rooms:
                            room = db.query(Room).filter(Room.id == room_id).first()
                            conflicts.append({
                                'type': 'regular_vs_regular',
                                'room_id': room_id,
                                'room_number': room.number if room else f'Room {room_id}',
                                'booking1_id': f'BK-{str(booking1.id).zfill(6)}',
                                'booking1_dates': f'{booking1.check_in} to {booking1.check_out}',
                                'booking1_guest': booking1.guest_name,
                                'booking2_id': f'BK-{str(booking2.id).zfill(6)}',
                                'booking2_dates': f'{booking2.check_in} to {booking2.check_out}',
                                'booking2_guest': booking2.guest_name,
                            })
        
        # Check package bookings against each other
        for i, booking1 in enumerate(package_bookings):
            for booking2 in package_bookings[i+1:]:
                rooms1 = [pbr.room_id for pbr in booking1.rooms]
                rooms2 = [pbr.room_id for pbr in booking2.rooms]
                
                common_rooms = set(rooms1) & set(rooms2)
                if common_rooms:
                    if booking1.check_in < booking2.check_out and booking1.check_out > booking2.check_in:
                        for room_id in common_rooms:
                            room = db.query(Room).filter(Room.id == room_id).first()
                            conflicts.append({
                                'type': 'package_vs_package',
                                'room_id': room_id,
                                'room_number': room.number if room else f'Room {room_id}',
                                'booking1_id': f'PK-{str(booking1.id).zfill(6)}',
                                'booking1_dates': f'{booking1.check_in} to {booking1.check_out}',
                                'booking1_guest': booking1.guest_name,
                                'booking2_id': f'PK-{str(booking2.id).zfill(6)}',
                                'booking2_dates': f'{booking2.check_in} to {booking2.check_out}',
                                'booking2_guest': booking2.guest_name,
                            })
        
        # Check regular bookings against package bookings
        for regular_booking in regular_bookings:
            for package_booking in package_bookings:
                rooms_regular = [br.room_id for br in regular_booking.booking_rooms]
                rooms_package = [pbr.room_id for pbr in package_booking.rooms]
                
                common_rooms = set(rooms_regular) & set(rooms_package)
                if common_rooms:
                    if regular_booking.check_in < package_booking.check_out and regular_booking.check_out > package_booking.check_in:
                        for room_id in common_rooms:
                            room = db.query(Room).filter(Room.id == room_id).first()
                            conflicts.append({
                                'type': 'regular_vs_package',
                                'room_id': room_id,
                                'room_number': room.number if room else f'Room {room_id}',
                                'booking1_id': f'BK-{str(regular_booking.id).zfill(6)}',
                                'booking1_dates': f'{regular_booking.check_in} to {regular_booking.check_out}',
                                'booking1_guest': regular_booking.guest_name,
                                'booking2_id': f'PK-{str(package_booking.id).zfill(6)}',
                                'booking2_dates': f'{package_booking.check_in} to {package_booking.check_out}',
                                'booking2_guest': package_booking.guest_name,
                            })
        
        # Print results
        if conflicts:
            print(f"\n⚠️  Found {len(conflicts)} booking conflict(s):\n")
            for i, conflict in enumerate(conflicts, 1):
                print(f"Conflict {i}:")
                print(f"  Room: {conflict['room_number']} (ID: {conflict['room_id']})")
                print(f"  {conflict['booking1_id']} ({conflict['booking1_guest']}): {conflict['booking1_dates']}")
                print(f"  {conflict['booking2_id']} ({conflict['booking2_guest']}): {conflict['booking2_dates']}")
                print(f"  Type: {conflict['type']}")
                print()
            return False
        else:
            print("\n✅ No booking conflicts found!")
            return True
            
    except Exception as e:
        print(f"\n❌ Error checking conflicts: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = check_conflicts()
    sys.exit(0 if success else 1)

