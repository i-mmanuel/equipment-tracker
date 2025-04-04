import React, { useContext, useState } from 'react';
import { EquipmentContext } from '../context/EquipmentContext.jsx';
import { ThemeContext } from '../context/ThemeContext.jsx';

const BookingCalendar = () => {
  const { equipment, bookings, addBooking } = useContext(EquipmentContext);
  const { darkMode } = useContext(ThemeContext);

  const [bookingDate, setBookingDate] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [bookingName, setBookingName] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(true);

  const handleEquipmentToggle = (id) => {
    if (selectedEquipment.includes(id)) {
      setSelectedEquipment(selectedEquipment.filter((itemId) => itemId !== id));
    } else {
      setSelectedEquipment([...selectedEquipment, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    if (!bookingDate || selectedEquipment.length === 0 || !bookingName) {
      alert(
        'Please fill in all required fields and select at least one equipment item.'
      );
      return;
    }

    // Create new booking
    const newBooking = {
      date: bookingDate,
      equipmentIds: selectedEquipment,
      name: bookingName,
      notes: bookingNotes,
      status: 'requested',
    };

    addBooking(newBooking);

    // Reset form
    setBookingDate('');
    setSelectedEquipment([]);
    setBookingName('');
    setBookingNotes('');
  };

  // Check if equipment is already booked for the selected date
  const isEquipmentBooked = (equipmentId) => {
    if (!bookingDate) return false;

    return bookings.some(
      (booking) =>
        booking.date === bookingDate &&
        booking.equipmentIds.includes(equipmentId) &&
        ['requested', 'dispatched', 'packed'].includes(booking.status)
    );
  };

  // For small screens, allow toggling between form and equipment list
  const toggleView = () => {
    setShowBookingForm(!showBookingForm);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold mb-1">
          Schedule Equipment
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Book equipment for specific dates
        </p>
      </div>

      {/* Mobile view toggle */}
      <div className="flex md:hidden mb-4">
        <div className="w-full flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setShowBookingForm(true)}
            className={`relative inline-flex items-center justify-center flex-1 py-2 text-sm font-medium rounded-l-md border ${
              showBookingForm
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Booking Form
          </button>
          <button
            type="button"
            onClick={() => setShowBookingForm(false)}
            className={`relative inline-flex items-center justify-center flex-1 py-2 text-sm font-medium rounded-r-md border ${
              !showBookingForm
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Select Equipment
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Booking Form - Hidden on mobile when not active */}
        <div
          className={`md:col-span-1 ${
            !showBookingForm ? 'hidden md:block' : ''
          }`}
        >
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
            <h2 className="text-lg font-medium mb-4">New Booking</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="bookingDate"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Booking Date *
                </label>
                <input
                  type="date"
                  id="bookingDate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="bookingName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Booking Name/Purpose *
                </label>
                <input
                  type="text"
                  id="bookingName"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={bookingName}
                  onChange={(e) => setBookingName(e.target.value)}
                  placeholder="e.g., Event name, Project, etc."
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="bookingNotes"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                >
                  Notes
                </label>
                <textarea
                  id="bookingNotes"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  rows="3"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Additional information about this booking"
                />
              </div>

              {/* Mobile: Show selected count */}
              <div className="md:hidden text-sm text-gray-600 dark:text-gray-400">
                Selected equipment: {selectedEquipment.length} item
                {selectedEquipment.length !== 1 ? 's' : ''}
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={selectedEquipment.length === 0}
                  className={`w-full px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    selectedEquipment.length === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  Book Selected Equipment
                </button>

                {/* Mobile: Button to switch to equipment selection */}
                <button
                  type="button"
                  onClick={toggleView}
                  className="md:hidden w-full mt-2 px-4 py-2 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Select Equipment
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Equipment Selection - Hidden on mobile when not active */}
        <div
          className={`md:col-span-2 ${
            showBookingForm ? 'hidden md:block' : ''
          }`}
        >
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Select Equipment</h2>

              {/* Mobile: Item count and done button */}
              <div className="md:hidden flex items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-3">
                  {selectedEquipment.length} selected
                </span>
                <button
                  onClick={toggleView}
                  className="text-primary font-medium"
                >
                  Done
                </button>
              </div>
            </div>

            {bookingDate ? (
              equipment.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {equipment.map((item) => {
                    const isBooked = isEquipmentBooked(item.id);

                    return (
                      <div
                        key={item.id}
                        className={`flex items-start p-3 border rounded-md ${
                          isBooked
                            ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                            : selectedEquipment.includes(item.id)
                            ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex h-5 items-center mr-3">
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700"
                            checked={selectedEquipment.includes(item.id)}
                            onChange={() => handleEquipmentToggle(item.id)}
                            disabled={isBooked}
                          />
                        </div>
                        <div className="min-w-0 flex-1 pt-0.5">
                          <p
                            className={`font-medium ${
                              isBooked
                                ? 'text-gray-500 dark:text-gray-400'
                                : 'text-gray-900 dark:text-white'
                            }`}
                          >
                            {item.name}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {item.type} • SN: {item.serialNumber}
                          </p>
                          {isBooked && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                              Already booked for this date
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="mt-2 text-sm">
                    No equipment available. Please add equipment first.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-sm">
                  Please select a date to see available equipment.
                </p>
              </div>
            )}

            {/* Mobile: Button to return to form */}
            <div className="mt-4 md:hidden">
              <button
                onClick={toggleView}
                className="w-full px-4 py-2 border border-gray-300 text-gray-700 dark:border-gray-600 dark:text-gray-200 rounded-md shadow-sm bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Back to Booking Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingCalendar;
