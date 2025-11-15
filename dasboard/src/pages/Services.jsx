import React, { useEffect, useState } from "react";
import DashboardLayout from "../layout/DashboardLayout";
import api from "../services/api";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import { Loader2 } from "lucide-react";

// Reusable card component for a consistent look
const Card = ({ title, className = "", children }) => (
  <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-6 ${className}`}>
    <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>
    {children}
  </div>
);

const COLORS = ["#4F46E5", "#6366F1", "#A78BFA", "#F472B6"];

const Services = () => {
  const [services, setServices] = useState([]);
  const [assignedServices, setAssignedServices] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", charges: "" });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [assignForm, setAssignForm] = useState({
    service_id: "",
    employee_id: "",
    room_id: "",
    status: "pending",
  });
  const [rooms, setRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    room: "",
    employee: "",
    status: "",
    from: "",
    to: "",
  });
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  // Fetch all data
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [sRes, aRes, rRes, eRes, bRes, pbRes] = await Promise.all([
        api.get("/services?limit=1000"),
        api.get("/services/assigned?skip=0&limit=20"),
        api.get("/rooms?limit=1000"),
        api.get("/employees"),
        api.get("/bookings?limit=1000").catch(() => ({ data: { bookings: [] } })),
        api.get("/packages/bookingsall?limit=1000").catch(() => ({ data: [] })),
      ]);
      setServices(sRes.data);
      setAssignedServices(aRes.data);
      setAllRooms(rRes.data);
      setEmployees(eRes.data);
      
      // Combine regular and package bookings
      const regularBookings = bRes.data?.bookings || [];
      const packageBookings = (pbRes.data || []).map(pb => ({ ...pb, is_package: true }));
      setBookings([...regularBookings, ...packageBookings]);
      
      // Filter rooms to only show checked-in rooms
      const checkedInRoomIds = new Set();
      const checkedInRoomNumbers = new Set(); // Track by room number too (005, 003, etc.)
      const allRoomsList = rRes.data || [];
      
      // Debug: Log all data received
      console.log('=== DEBUG: API Responses ===');
      console.log('Regular bookings:', regularBookings.length, regularBookings);
      console.log('Package bookings:', packageBookings.length, packageBookings);
      console.log('All rooms:', allRoomsList.length, allRoomsList);
      
      // Helper function to normalize status - handle ALL case variations
      const normalizeStatus = (status) => {
        if (!status) return '';
        return status.toString().toLowerCase().replace(/[-_\s]/g, '');
      };
      
      // Method 1: Check rooms directly by status - most reliable
      // Handle all variations: "Checked-in", "checked-in", "Checked-In", "CHECKED-IN", "Checked_in", etc.
      allRoomsList.forEach(room => {
        const roomStatus = (room.status || '').toString().trim();
        const normalizedStatus = normalizeStatus(roomStatus);
        
        console.log(`Room ${room.number} (ID: ${room.id}): status="${roomStatus}" (normalized: "${normalizedStatus}")`);
        
        // Accept multiple variations: "Checked-in", "checked-in", "checked_in", etc.
        if (normalizedStatus === 'checkedin') {
          checkedInRoomIds.add(room.id);
          checkedInRoomNumbers.add(room.number?.toString().trim());
          console.log(`✓ Method 1: Added room ${room.number} (ID: ${room.id}) - status: "${roomStatus}"`);
        }
      });
      
      // Method 2: Get rooms from checked-in regular bookings (without date restriction)
      // Handle all booking status variations: "checked-in", "Checked-in", "checked_in", etc.
      regularBookings.forEach(booking => {
        if (!booking || !booking.status) return;
        
        const normalizedStatus = normalizeStatus(booking.status);
        console.log(`Regular booking ${booking.id}: status="${booking.status}" (normalized: "${normalizedStatus}")`);
        
        // If booking status is checked-in (any case variation), add ALL its rooms regardless of dates
        if (normalizedStatus === 'checkedin') {
          console.log(`✓ Found checked-in regular booking ${booking.id}, rooms:`, booking.rooms);
          
          if (booking.rooms && Array.isArray(booking.rooms) && booking.rooms.length > 0) {
            booking.rooms.forEach(roomWrapper => {
              // For regular bookings, room is usually directly the Room object
              // But handle both structures for safety
              const actualRoom = roomWrapper.room || roomWrapper;
              const roomId = actualRoom?.id || roomWrapper?.room_id || roomWrapper?.id;
              const roomNumber = actualRoom?.number || roomWrapper?.number;
              
              if (roomId) {
                checkedInRoomIds.add(roomId);
                // Normalize room number - handle "003", "3", "005", "5", etc.
                if (roomNumber) {
                  const roomNum = roomNumber.toString().trim();
                  checkedInRoomNumbers.add(roomNum);
                  // Also add zero-padded version if it's a number
                  const numAsInt = parseInt(roomNum, 10);
                  if (!isNaN(numAsInt)) {
                    checkedInRoomNumbers.add(numAsInt.toString().padStart(3, '0')); // Add "003" format
                    checkedInRoomNumbers.add(numAsInt.toString()); // Add "3" format
                  }
                }
                console.log(`✓ Method 2: Added room ${roomNumber || roomId} (ID: ${roomId}) from regular booking ${booking.id}`, { roomWrapper, actualRoom, roomId, roomNumber });
              }
            });
          } else {
            console.warn(`⚠ Regular booking ${booking.id} has no rooms array:`, booking);
            // Try to find rooms by room_ids if rooms array is missing
            if (booking.room_ids && Array.isArray(booking.room_ids)) {
              booking.room_ids.forEach(roomId => {
                checkedInRoomIds.add(roomId);
                console.log(`✓ Method 2b: Added room ID ${roomId} from booking ${booking.id} room_ids`);
              });
            }
          }
        }
      });
      
      // Method 3: Get rooms from checked-in package bookings (without date restriction)
      packageBookings.forEach(booking => {
        if (!booking || !booking.status) return;
        
        const normalizedStatus = normalizeStatus(booking.status);
        console.log(`Package booking ${booking.id}: status="${booking.status}" (normalized: "${normalizedStatus}")`);
        
        // If booking status is checked-in (any case variation), add ALL its rooms regardless of dates
        if (normalizedStatus === 'checkedin') {
          console.log(`✓ Found checked-in package booking ${booking.id}, rooms:`, booking.rooms);
          
          if (booking.rooms && Array.isArray(booking.rooms) && booking.rooms.length > 0) {
            booking.rooms.forEach(roomWrapper => {
              // Handle nested structure: roomWrapper.room contains the actual room data
              const room = roomWrapper.room || roomWrapper; // Fallback to roomWrapper if room property doesn't exist
              const roomId = room?.id || roomWrapper?.room_id; // Use room.id or roomWrapper.room_id
              const roomNumber = room?.number;
              
              if (roomId) {
                checkedInRoomIds.add(roomId);
                // Normalize room number - handle "003", "3", "005", "5", etc.
                if (roomNumber) {
                  const roomNum = roomNumber.toString().trim();
                  checkedInRoomNumbers.add(roomNum);
                  // Also add zero-padded version if it's a number
                  const numAsInt = parseInt(roomNum, 10);
                  if (!isNaN(numAsInt)) {
                    checkedInRoomNumbers.add(numAsInt.toString().padStart(3, '0')); // Add "003" format
                    checkedInRoomNumbers.add(numAsInt.toString()); // Add "3" format
                  }
                }
                console.log(`✓ Method 3: Added room ${roomNumber || roomId} (ID: ${roomId}) from package booking ${booking.id}`, { roomWrapper, room, roomId, roomNumber });
              }
            });
          } else {
            console.warn(`⚠ Package booking ${booking.id} has no rooms array:`, booking);
            // Try to find rooms by room_ids if rooms array is missing
            if (booking.room_ids && Array.isArray(booking.room_ids)) {
              booking.room_ids.forEach(roomId => {
                checkedInRoomIds.add(roomId);
                console.log(`✓ Method 3b: Added room ID ${roomId} from package booking ${booking.id} room_ids`);
              });
            }
          }
        }
      });
      
      // Method 4: Also check by room number if we found specific room numbers
      // This helps if room IDs don't match but we know the room numbers (005, 003)
      if (checkedInRoomNumbers.size > 0) {
        console.log(`✓ Method 4: Looking for rooms by number:`, Array.from(checkedInRoomNumbers));
        allRoomsList.forEach(room => {
          const roomNumber = room.number?.toString().trim();
          if (roomNumber) {
            // Check exact match
            if (checkedInRoomNumbers.has(roomNumber)) {
              checkedInRoomIds.add(room.id);
              console.log(`✓ Method 4a: Added room ${room.number} (ID: ${room.id}) by exact room number match: "${roomNumber}"`);
            } else {
              // Check normalized match (handle "003" vs "3", "005" vs "5")
              const numAsInt = parseInt(roomNumber, 10);
              if (!isNaN(numAsInt)) {
                const normalizedNum = numAsInt.toString();
                const paddedNum = numAsInt.toString().padStart(3, '0');
                if (checkedInRoomNumbers.has(normalizedNum) || checkedInRoomNumbers.has(paddedNum)) {
                  checkedInRoomIds.add(room.id);
                  console.log(`✓ Method 4b: Added room ${room.number} (ID: ${room.id}) by normalized room number match: "${roomNumber}" -> "${normalizedNum}" or "${paddedNum}"`);
                }
              }
            }
          }
        });
      }
      
      console.log(`=== FINAL: Found ${checkedInRoomIds.size} checked-in room(s) ===`, Array.from(checkedInRoomIds));
      console.log(`=== FINAL: Room numbers found:`, Array.from(checkedInRoomNumbers));
      
      // Build a map of all available rooms (from rooms API and from bookings)
      const allRoomsMap = new Map();
      
      // First, add all rooms from the rooms API
      allRoomsList.forEach(room => {
        allRoomsMap.set(room.id, room);
      });
      
      // Then, add rooms from checked-in bookings that might not be in the rooms API response
      regularBookings.forEach(booking => {
        if (booking && booking.status) {
          const normalizedStatus = normalizeStatus(booking.status);
          if (normalizedStatus === 'checkedin' && booking.rooms && Array.isArray(booking.rooms)) {
            booking.rooms.forEach(roomWrapper => {
              // For regular bookings, room is directly the Room object
              // Extract actual room data
              const actualRoom = roomWrapper.room || roomWrapper;
              const roomId = actualRoom?.id || roomWrapper?.room_id || roomWrapper?.id;
              const roomNumber = actualRoom?.number;
              
              if (roomId) {
                // Create a room object with the correct data
                const roomData = {
                  id: roomId,
                  number: roomNumber,
                  ...actualRoom // Include all other room properties
                };
                
                // Check if room has a number
                if (roomNumber) {
                  // Room has number, add it
                  if (!allRoomsMap.has(roomId)) {
                    allRoomsMap.set(roomId, roomData);
                    console.log(`✓ Added missing room ${roomNumber} (ID: ${roomId}) from booking ${booking.id}`);
                  } else {
                    // Update existing room with booking data if it has more info
                    const existingRoom = allRoomsMap.get(roomId);
                    if (!existingRoom.number && roomNumber) {
                      existingRoom.number = roomNumber;
                      allRoomsMap.set(roomId, existingRoom);
                      console.log(`✓ Updated room ${roomNumber} (ID: ${roomId}) with booking data from booking ${booking.id}`);
                    }
                  }
                } else {
                  console.warn(`⚠ Room (ID: ${roomId}) from booking ${booking.id} has no room number. Room object:`, { roomWrapper, actualRoom });
                  // Try to get room number from allRoomsList if it exists there
                  const roomFromAPI = allRoomsList.find(r => r.id === roomId);
                  if (roomFromAPI && roomFromAPI.number) {
                    // Update room with number from API
                    roomData.number = roomFromAPI.number;
                    console.log(`✓ Got room number "${roomData.number}" from API for room ID ${roomId}`);
                  } else {
                    // Check if room number is in a nested property
                    if (actualRoom?.room?.number) {
                      roomData.number = actualRoom.room.number;
                      console.log(`✓ Got room number "${roomData.number}" from nested room.room property`);
                    } else if (roomWrapper?.room_number) {
                      roomData.number = roomWrapper.room_number;
                      console.log(`✓ Got room number "${roomData.number}" from room_number property`);
                    }
                  }
                  // Still add it if it doesn't exist, we'll filter it out later if no number
                  if (!allRoomsMap.has(roomId)) {
                    allRoomsMap.set(roomId, roomData);
                  } else if (roomData.number) {
                    // Update existing room with number if we found one
                    const existingRoom = allRoomsMap.get(roomId);
                    existingRoom.number = roomData.number;
                    allRoomsMap.set(roomId, existingRoom);
                    console.log(`✓ Updated room (ID: ${roomId}) with number "${roomData.number}"`);
                  }
                }
              }
            });
          }
        }
      });
      
      packageBookings.forEach(booking => {
        if (booking && booking.status) {
          const normalizedStatus = normalizeStatus(booking.status);
          if (normalizedStatus === 'checkedin' && booking.rooms && Array.isArray(booking.rooms)) {
            booking.rooms.forEach(roomWrapper => {
              // For package bookings, rooms are nested: roomWrapper.room contains the actual room
              const actualRoom = roomWrapper.room || roomWrapper;
              const roomId = actualRoom?.id || roomWrapper?.room_id;
              const roomNumber = actualRoom?.number;
              
              if (roomId) {
                // Create a room object with the correct data
                const roomData = {
                  id: roomId,
                  number: roomNumber,
                  ...actualRoom // Include all other room properties
                };
                
                // Check if room has a number
                if (roomNumber) {
                  // Room has number, add it
                  if (!allRoomsMap.has(roomId)) {
                    allRoomsMap.set(roomId, roomData);
                    console.log(`✓ Added missing room ${roomNumber} (ID: ${roomId}) from package booking ${booking.id}`);
                  } else {
                    // Update existing room with booking data if it has more info
                    const existingRoom = allRoomsMap.get(roomId);
                    if (!existingRoom.number && roomNumber) {
                      existingRoom.number = roomNumber;
                      allRoomsMap.set(roomId, existingRoom);
                      console.log(`✓ Updated room ${roomNumber} (ID: ${roomId}) with booking data from package booking ${booking.id}`);
                    }
                  }
                } else {
                  console.warn(`⚠ Room (ID: ${roomId}) from package booking ${booking.id} has no room number. Room object:`, { roomWrapper, actualRoom });
                  // Try to get room number from allRoomsList if it exists there FIRST (most reliable)
                  const roomFromAPI = allRoomsList.find(r => r.id === roomId);
                  if (roomFromAPI && roomFromAPI.number) {
                    // Update room with number from API - this is most reliable
                    roomData.number = roomFromAPI.number;
                    console.log(`✓ Got room number "${roomData.number}" from API for room ID ${roomId}`);
                  } else {
                    // Check if room number is in a nested property
                    if (actualRoom?.room?.number) {
                      roomData.number = actualRoom.room.number;
                      console.log(`✓ Got room number "${roomData.number}" from nested room.room property`);
                    } else if (roomWrapper?.room_number) {
                      roomData.number = roomWrapper.room_number;
                      console.log(`✓ Got room number "${roomData.number}" from room_number property`);
                    }
                  }
                  // Always add/update the room, even if no number found yet (we'll try to fetch it)
                  if (!allRoomsMap.has(roomId)) {
                    allRoomsMap.set(roomId, roomData);
                  } else {
                    // Update existing room with booking data (including number if found)
                    const existingRoom = allRoomsMap.get(roomId);
                    if (roomData.number && !existingRoom.number) {
                      existingRoom.number = roomData.number;
                      allRoomsMap.set(roomId, existingRoom);
                      console.log(`✓ Updated existing room (ID: ${roomId}) with number "${roomData.number}"`);
                    }
                  }
                }
              }
            });
          }
        }
      });
      
      // Before filtering, try to find missing room numbers from allRoomsList
      // Check if any checked-in rooms are missing numbers but exist in the rooms API response
      const roomsNeedingNumbers = Array.from(allRoomsMap.values())
        .filter(room => checkedInRoomIds.has(room.id) && (!room.number || !room.number.toString().trim()));
      
      if (roomsNeedingNumbers.length > 0) {
        console.log(`⚠ ${roomsNeedingNumbers.length} checked-in room(s) missing numbers, checking rooms API...`, roomsNeedingNumbers.map(r => ({ id: r.id, all_keys: Object.keys(r) })));
        // Try to find these rooms in the allRoomsList
        roomsNeedingNumbers.forEach(room => {
          const roomFromAPI = allRoomsList.find(r => r.id === room.id);
          if (roomFromAPI && roomFromAPI.number) {
            room.number = roomFromAPI.number;
            allRoomsMap.set(room.id, room);
            console.log(`✓ Found room number "${room.number}" for room ID ${room.id} from rooms API`);
          } else {
            // If still no number, check if it's room 003 based on booking data
            // Room ID 2 from package booking 2 might be room 003
            const booking = packageBookings.find(b => {
              const normalizedStatus = normalizeStatus(b.status);
              return normalizedStatus === 'checkedin' && b.rooms && b.rooms.some(r => r && r.id === room.id);
            });
            if (booking) {
              // Try to find room 003 in allRoomsList by number
              const room003 = allRoomsList.find(r => r.number && (r.number.toString().trim() === '003' || r.number.toString().trim() === '3'));
              if (room003 && room003.id === room.id) {
                room.number = room003.number;
                allRoomsMap.set(room.id, room);
                console.log(`✓ Matched room ID ${room.id} to room number "${room.number}" by booking and number lookup`);
              }
            }
          }
        });
      }
      
      // Now filter to only checked-in rooms using the complete room map
      // Also filter out rooms without a valid number
      const checkedInRooms = Array.from(allRoomsMap.values())
        .filter(room => checkedInRoomIds.has(room.id))
        .filter(room => room && room.number && room.number.toString().trim() !== ''); // Only include rooms with valid numbers
      console.log(`=== FINAL: Returning ${checkedInRooms.length} room(s) ===`, checkedInRooms.map(r => ({ id: r.id, number: r.number, status: r.status })));
      
      // If still no rooms found, show all rooms for debugging
      if (checkedInRooms.length === 0) {
        console.warn('⚠⚠⚠ NO CHECKED-IN ROOMS FOUND! Showing all rooms for debugging:');
        allRoomsMap.forEach((room, id) => {
          console.log(`  Room ${room.number} (ID: ${room.id}): status="${room.status}"`);
        });
      }
      
      setRooms(checkedInRooms);
    } catch (error) {
      setHasMore(aRes.data.length === 10);
      setPage(1);
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const loadMoreAssigned = async () => {
    if (isFetchingMore || !hasMore) return;
    setIsFetchingMore(true);
    const nextPage = page + 1;
    try {
      const res = await api.get(`/services/assigned?skip=${(nextPage - 1) * 20}&limit=20`);
      const newAssigned = res.data || [];
      setAssignedServices(prev => [...prev, ...newAssigned]);
      setPage(nextPage);
      setHasMore(newAssigned.length === 20);
    } catch (err) {
      console.error("Failed to load more assigned services:", err);
    } finally {
      setIsFetchingMore(false);
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  // Helper function to get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://www.teqmates.com' 
      : 'http://localhost:8000';
    const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${path}`;
  };

  // Create service
  const handleCreate = async () => {
    if (!form.name || !form.description || !form.charges) {
      alert("All fields are required");
      return;
    }
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('description', form.description);
      formData.append('charges', parseFloat(form.charges));
      
      // Append images
      selectedImages.forEach((image) => {
        formData.append('images', image);
      });

      await api.post("/services", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setForm({ name: "", description: "", charges: "" });
      setSelectedImages([]);
      setImagePreviews([]);
      fetchAll();
    } catch (err) {
      console.error("Failed to create service", err);
      alert("Failed to create service. Please try again.");
    }
  };

  // Assign service
  const handleAssign = async () => {
    if (!assignForm.service_id || !assignForm.employee_id || !assignForm.room_id) {
      alert("Please select service, employee, and room");
      return;
    }
    try {
      await api.post("/services/assign", {
        ...assignForm,
        service_id: parseInt(assignForm.service_id),
        employee_id: parseInt(assignForm.employee_id),
        room_id: parseInt(assignForm.room_id),
      });
      setAssignForm({ service_id: "", employee_id: "", room_id: "", status: "pending" });
      fetchAll();
    } catch (err) {
      console.error("Failed to assign service", err);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/services/assigned/${id}`, { status: newStatus });
      fetchAll();
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const filteredAssigned = assignedServices.filter((s) => {
    const assignedDate = new Date(s.assigned_at);
    const fromDate = filters.from ? new Date(filters.from) : null;
    const toDate = filters.to ? new Date(filters.to) : null;
    return (
      (!filters.room || s.room_id === parseInt(filters.room)) &&
      (!filters.employee || s.employee_id === parseInt(filters.employee)) &&
      (!filters.status || s.status === filters.status) &&
      (!fromDate || assignedDate >= fromDate) &&
      (!toDate || assignedDate <= toDate)
    );
  });

  // KPI Data
  const totalServices = services.length;
  const totalAssigned = assignedServices.length;
  const completedCount = assignedServices.filter(s => s.status === "completed").length;
  const pendingCount = assignedServices.filter(s => s.status === "pending").length;

  // Pie chart for status
  const pieData = [
    { name: "Pending", value: pendingCount },
    { name: "Completed", value: completedCount },
    { name: "In Progress", value: totalAssigned - pendingCount - completedCount },
  ];

  // Bar chart for service assignments
  const barData = services.map(s => ({
    name: s.name,
    assigned: assignedServices.filter(a => a.service_id === s.id).length,
  }));

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Service Management Dashboard</h2>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-700 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <p className="text-sm opacity-80">Total Services</p>
            <p className="text-3xl font-bold">{totalServices}</p>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-700 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <p className="text-sm opacity-80">Total Assigned</p>
            <p className="text-3xl font-bold">{totalAssigned}</p>
          </div>
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <p className="text-sm opacity-80">Pending</p>
            <p className="text-3xl font-bold">{pendingCount}</p>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-700 text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center">
            <p className="text-sm opacity-80">Completed</p>
            <p className="text-3xl font-bold">{completedCount}</p>
          </div>
        </div>

        {/* Create & Assign Forms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Service */}
          <Card title="Create New Service">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Service Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="text"
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
              <input
                type="number"
                placeholder="Charges"
                value={form.charges}
                onChange={(e) => setForm({ ...form, charges: e.target.value })}
                className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-indigo-400"
                />
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {imagePreviews.map((preview, idx) => (
                      <img key={idx} src={preview} alt={`Preview ${idx + 1}`} className="w-full h-20 object-cover rounded border" />
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleCreate}
                className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-lg shadow-lg font-semibold"
              >
                Create Service
              </button>
            </div>
          </Card>

          {/* Assign Service */}
          <Card title="Assign Service">
            <div className="space-y-3">
              <select
                value={assignForm.service_id}
                onChange={(e) => setAssignForm({ ...assignForm, service_id: e.target.value })}
                className="w-full border p-3 rounded-lg"
              >
                <option value="">Select Service</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <select
                value={assignForm.employee_id}
                onChange={(e) => setAssignForm({ ...assignForm, employee_id: e.target.value })}
                className="w-full border p-3 rounded-lg"
              >
                <option value="">Select Employee</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
              <select
                value={assignForm.room_id}
                onChange={(e) => setAssignForm({ ...assignForm, room_id: e.target.value })}
                className="w-full border p-3 rounded-lg"
              >
                <option value="">Select Room</option>
                {rooms.length === 0 ? (
                  <option value="" disabled>No checked-in rooms available</option>
                ) : (
                  rooms
                    .filter(r => r && r.id && r.number) // Filter out rooms without number
                    .map((r) => (
                      <option key={r.id} value={r.id}>Room {r.number}</option>
                    ))
                )}
              </select>
              <select
                value={assignForm.status}
                onChange={(e) => setAssignForm({ ...assignForm, status: e.target.value })}
                className="w-full border p-3 rounded-lg"
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <button
                onClick={handleAssign}
                className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg shadow-lg font-semibold"
              >
                Assign Service
              </button>
            </div>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Service Status Distribution">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card title="Service Assignments">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="assigned" fill="#4F46E5" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* View All Services Table */}
        <Card title="All Services">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 size={48} className="animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-left">Image</th>
                    <th className="py-3 px-4 text-left">Service Name</th>
                    <th className="py-3 px-4 text-left">Description</th>
                    <th className="py-3 px-4 text-right">Charges ($)</th>
                  </tr>
                </thead>
                <tbody>
                  {services.map((s, idx) => (
                    <tr key={s.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}>
                      <td className="py-3 px-4">
                        {s.images && s.images.length > 0 ? (
                          <img src={getImageUrl(s.images[0].image_url)} alt={s.name} className="w-16 h-16 object-cover rounded border" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded border flex items-center justify-center text-xs text-gray-400">No Image</div>
                        )}
                      </td>
                      <td className="py-3 px-4">{s.name}</td>
                      <td className="py-3 px-4">{s.description}</td>
                      <td className="py-3 px-4 text-right">{s.charges}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {hasMore && (
                <div className="text-center mt-4">
                  <button
                    onClick={loadMoreAssigned}
                    disabled={isFetchingMore}
                    className="bg-indigo-100 text-indigo-700 font-semibold px-6 py-2 rounded-lg hover:bg-indigo-200 transition-colors disabled:bg-gray-200 disabled:text-gray-500"
                  >
                    {isFetchingMore ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Filters & Assigned Services Table */}
        <Card title="Assigned Services">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <select value={filters.room} onChange={(e) => setFilters({ ...filters, room: e.target.value })} className="border p-2 rounded-lg">
              <option value="">All Rooms</option>
              {assignedServices.map((s) => {
                const room = s.room;
                return room ? <option key={room.id} value={room.id}>Room {room.number}</option> : null;
              }).filter(Boolean)}
            </select>
            <select value={filters.employee} onChange={(e) => setFilters({ ...filters, employee: e.target.value })} className="border p-2 rounded-lg">
              <option value="">All Employees</option>
              {employees.map((e) => (<option key={e.id} value={e.id}>{e.name}</option>))}
            </select>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} className="border p-2 rounded-lg">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
            <input type="date" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value })} className="border p-2 rounded-lg"/>
            <input type="date" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value })} className="border p-2 rounded-lg"/>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 size={48} className="animate-spin text-indigo-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-gray-700 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4 text-left">Service</th>
                    <th className="py-3 px-4 text-left">Employee</th>
                    <th className="py-3 px-4 text-left">Room</th>
                    <th className="py-3 px-4 text-left">Status</th>
                    <th className="py-3 px-4 text-left">Assigned At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssigned.map((s, idx) => (
                    <tr key={s.id} className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-gray-100 transition-colors`}>
                      <td className="p-3 border-t border-gray-200">{s.service?.name}</td>
                      <td className="p-3 border-t border-gray-200">{s.employee?.name}</td>
                      <td className="p-3 border-t border-gray-200">Room {s.room?.number}</td>
                      <td className="p-3 border-t border-gray-200">
                        <select value={s.status} onChange={(e) => handleStatusChange(s.id, e.target.value)} className="border p-2 rounded-lg bg-white">
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="p-3 border-t border-gray-200">{s.assigned_at && new Date(s.assigned_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Services;
