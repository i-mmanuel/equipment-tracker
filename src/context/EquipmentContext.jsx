import React, { createContext, useState, useEffect } from 'react';

export const EquipmentContext = createContext();

export const EquipmentProvider = ({ children }) => {
  // Mock database with localStorage
  const [equipment, setEquipment] = useState([]);
  const [bookings, setBookings] = useState([]);

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedEquipment = localStorage.getItem('equipment');
    const storedBookings = localStorage.getItem('bookings');

    if (storedEquipment) setEquipment(JSON.parse(storedEquipment));
    if (storedBookings) setBookings(JSON.parse(storedBookings));
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('equipment', JSON.stringify(equipment));
  }, [equipment]);

  useEffect(() => {
    localStorage.setItem('bookings', JSON.stringify(bookings));
  }, [bookings]);

  // CRUD operations for equipment
  const addEquipment = (newEquipment) => {
    // Create a timestamp for items without purchase date
    const purchaseDate =
      newEquipment.purchaseDate || new Date().toISOString().split('T')[0];

    setEquipment([
      ...equipment,
      {
        ...newEquipment,
        id: Date.now().toString(),
        purchaseDate,
      },
    ]);
  };

  const updateEquipment = (id, updatedEquipment) => {
    setEquipment(
      equipment.map((item) =>
        item.id === id ? { ...updatedEquipment, id } : item
      )
    );
  };

  const deleteEquipment = (id) => {
    setEquipment(equipment.filter((item) => item.id !== id));
    // Also remove any bookings for this equipment
    setBookings(
      bookings.filter((booking) => booking.equipmentIds.indexOf(id) === -1)
    );
  };

  // Booking operations
  const addBooking = (newBooking) => {
    setBookings([
      ...bookings,
      { ...newBooking, id: Date.now().toString(), status: 'requested' },
    ]);
  };

  const updateBookingStatus = (bookingId, newStatus) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      )
    );
  };

  const deleteBooking = (id) => {
    setBookings(bookings.filter((booking) => booking.id !== id));
  };

  return (
    <EquipmentContext.Provider
      value={{
        equipment,
        addEquipment,
        updateEquipment,
        deleteEquipment,
        bookings,
        addBooking,
        updateBookingStatus,
        deleteBooking,
      }}
    >
      {children}
    </EquipmentContext.Provider>
  );
};
