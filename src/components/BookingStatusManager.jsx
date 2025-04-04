import React, { useContext, useState } from 'react';
import { EquipmentContext } from '../context/EquipmentContext.jsx';
import { ThemeContext } from '../context/ThemeContext.jsx';

const BookingStatusManager = () => {
  const { bookings, equipment, updateBookingStatus, deleteBooking } =
    useContext(EquipmentContext);
  const { darkMode } = useContext(ThemeContext);

  const [filter, setFilter] = useState('all');

  // Get equipment names for a booking
  const getEquipmentNames = (equipmentIds) => {
    return equipmentIds
      .map((id) => {
        const item = equipment.find((equip) => equip.id === id);
        return item ? item.name : 'Unknown equipment';
      })
      .join(', ');
  };

  // Filter bookings based on selected filter
  const filteredBookings =
    filter === 'all'
      ? [...bookings].sort((a, b) => new Date(a.date) - new Date(b.date))
      : bookings
          .filter((booking) => booking.status === filter)
          .sort((a, b) => new Date(a.date) - new Date(b.date));

  const statusOptions = [
    { value: 'requested', label: 'Requested', color: 'bg-requested' },
    { value: 'dispatched', label: 'Dispatched', color: 'bg-dispatched' },
    { value: 'packed', label: 'Packed', color: 'bg-packed' },
    { value: 'returned', label: 'Returned', color: 'bg-returned' },
  ];

  // Group bookings by date for better organization
  const bookingsByDate = filteredBookings.reduce((acc, booking) => {
    const date = booking.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(booking);
    return acc;
  }, {});

  const getStatusColor = (status) => {
    const option = statusOptions.find((opt) => opt.value === status);
    return option ? option.color : '';
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Booking Status</h2>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className={`py-1.5 px-3 rounded-md font-medium transition-colors ${
            filter === 'all'
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
          }`}
          onClick={() => setFilter('all')}
        >
          All
        </button>
        {statusOptions.map((option) => (
          <button
            key={option.value}
            className={`py-1.5 px-3 rounded-md font-medium transition-colors ${
              filter === option.value
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setFilter(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="space-y-8">
        {Object.keys(bookingsByDate).length > 0 ? (
          Object.entries(bookingsByDate)
            .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
            .map(([date, dateBookings]) => (
              <div key={date} className="mb-8">
                <h3 className="text-lg font-semibold pb-2 mb-4 border-b border-gray-200 dark:border-gray-700">
                  {new Date(date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dateBookings.map((booking) => (
                    <div key={booking.id} className="card">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium">{booking.name}</h4>
                        <span
                          className={`status-badge ${getStatusColor(
                            booking.status
                          )}`}
                        >
                          {booking.status.charAt(0).toUpperCase() +
                            booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="mb-4 text-sm">
                        <p className="mb-1">
                          <span className="font-medium">Equipment:</span>{' '}
                          {getEquipmentNames(booking.equipmentIds)}
                        </p>
                        {booking.notes && (
                          <p>
                            <span className="font-medium">Notes:</span>{' '}
                            {booking.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 mt-3">
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            updateBookingStatus(booking.id, e.target.value)
                          }
                          className="form-input py-1 flex-1"
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <button
                          className="btn btn-danger py-1"
                          onClick={() => {
                            if (
                              window.confirm(
                                'Are you sure you want to delete this booking?'
                              )
                            ) {
                              deleteBooking(booking.id);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8 italic">
            No bookings found.
          </p>
        )}
      </div>
    </div>
  );
};

export default BookingStatusManager;
