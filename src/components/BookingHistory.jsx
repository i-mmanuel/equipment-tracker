import React, { useContext, useState } from 'react';
import { EquipmentContext } from '../context/EquipmentContext.jsx';
import { ThemeContext } from '../context/ThemeContext.jsx';

const BookingHistory = () => {
  const { bookings, equipment, updateBookingStatus, deleteBooking } =
    useContext(EquipmentContext);
  const { darkMode } = useContext(ThemeContext);

  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sort bookings by date, newest first
  const sortedBookings = [...bookings].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Filter bookings based on selected filter and search query
  const filteredBookings = sortedBookings.filter((booking) => {
    const matchesFilter = filter === 'all' || booking.status === filter;
    const matchesSearch =
      searchQuery === '' ||
      booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getEquipmentNames(booking.equipmentIds)
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Get equipment names for a booking
  const getEquipmentNames = (equipmentIds) => {
    return equipmentIds
      .map((id) => {
        const item = equipment.find((equip) => equip.id === id);
        return item ? item.name : 'Unknown equipment';
      })
      .join(', ');
  };

  const getEquipmentCount = (equipmentIds) => {
    return equipmentIds.length;
  };

  const statusOptions = [
    { value: 'all', label: 'All Bookings' },
    { value: 'requested', label: 'Requested', color: 'bg-requested' },
    { value: 'dispatched', label: 'Dispatched', color: 'bg-dispatched' },
    { value: 'packed', label: 'Packed', color: 'bg-packed' },
    { value: 'returned', label: 'Returned', color: 'bg-returned' },
  ];

  const getStatusBadge = (status) => {
    const statusStyles = {
      requested: 'bg-requested text-white',
      dispatched: 'bg-dispatched text-white',
      packed: 'bg-packed text-white',
      returned: 'bg-returned text-white',
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Booking card for mobile view
  const BookingCard = ({ booking }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-gray-900 dark:text-white">
          {booking.name}
        </h3>
        {getStatusBadge(booking.status)}
      </div>

      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">Date</span>
          <span className="text-sm font-medium">
            {new Date(booking.date).toLocaleDateString()}
          </span>
        </div>
        <div className="flex justify-between mb-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Equipment
          </span>
          <span className="text-sm">
            {getEquipmentCount(booking.equipmentIds)} items
          </span>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          Equipment List
        </p>
        <p className="text-sm">{getEquipmentNames(booking.equipmentIds)}</p>
      </div>

      {booking.notes && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes</p>
          <p className="text-sm">{booking.notes}</p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between">
        <select
          value={booking.status}
          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          {statusOptions.slice(1).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            if (
              window.confirm('Are you sure you want to delete this booking?')
            ) {
              deleteBooking(booking.id);
            }
          }}
          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );

  // Group bookings by month
  const groupByMonth = (bookings) => {
    const grouped = {};

    bookings.forEach((booking) => {
      const date = new Date(booking.date);
      const monthYear = `${date.toLocaleString('default', {
        month: 'long',
      })} ${date.getFullYear()}`;

      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }

      grouped[monthYear].push(booking);
    });

    return grouped;
  };

  const groupedBookings = groupByMonth(filteredBookings);

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold mb-1">Booking History</h1>
        <p className="text-gray-500 dark:text-gray-400">
          View and manage your equipment bookings
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search input */}
        <div className="w-full md:w-1/2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search bookings..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Bookings
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {bookings.length}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Upcoming Bookings
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {
              bookings.filter(
                (b) => new Date(b.date) >= new Date() && b.status !== 'returned'
              ).length
            }
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            This Month
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {
              bookings.filter((b) => {
                const date = new Date(b.date);
                const today = new Date();
                return (
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear()
                );
              }).length
            }
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Total Items Booked
          </p>
          <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
            {bookings.reduce(
              (total, booking) => total + booking.equipmentIds.length,
              0
            )}
          </p>
        </div>
      </div>

      {/* Mobile view - Card based */}
      <div className="md:hidden">
        {filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400">
            {bookings.length === 0
              ? 'No bookings yet'
              : 'No bookings found matching your search'}
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedBookings).map(([month, monthBookings]) => (
              <div key={month}>
                <h3 className="text-md font-medium text-gray-600 dark:text-gray-300 mb-2">
                  {month}
                </h3>
                <div className="space-y-3">
                  {monthBookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Desktop view - Table based */}
      <div className="hidden md:block">
        {filteredBookings.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400">
            {bookings.length === 0
              ? 'No bookings yet'
              : 'No bookings found matching your search'}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Booking Name
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Equipment
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-750"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {booking.name}
                        {booking.notes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate max-w-xs">
                            {booking.notes}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(booking.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">
                        {getEquipmentNames(booking.equipmentIds)}
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          {getEquipmentCount(booking.equipmentIds)} items
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(booking.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            updateBookingStatus(booking.id, e.target.value)
                          }
                          className="mr-3 px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                          {statusOptions.slice(1).map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                'Are you sure you want to delete this booking?'
                              )
                            ) {
                              deleteBooking(booking.id);
                            }
                          }}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingHistory;
