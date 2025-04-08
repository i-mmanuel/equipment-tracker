import React, { useContext, useState, useEffect } from "react";
import { EquipmentContext } from "../context/EquipmentContext.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";

const BookingHistory = () => {
	const { bookings, equipment, updateBookingStatus, deleteBooking } = useContext(EquipmentContext);
	const { darkMode } = useContext(ThemeContext);

	const [filter, setFilter] = useState("all");
	const [searchQuery, setSearchQuery] = useState("");
	const [bookingDates, setBookingDates] = useState([]);
	const [selectedDate, setSelectedDate] = useState(null);
	const [equipmentForDate, setEquipmentForDate] = useState({});

	// Filter bookings based on selected filter and search query
	const filteredBookings = bookings.filter(booking => {
		const matchesFilter = filter === "all" || booking.status === filter;
		const matchesSearch =
			searchQuery === "" ||
			booking.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
			getEquipmentNames(booking.equipmentIds).toLowerCase().includes(searchQuery.toLowerCase());

		return matchesFilter && matchesSearch;
	});

	// Extract unique booking dates and sort them (newest first)
	useEffect(() => {
		const dates = filteredBookings
			.map(booking => booking.date)
			.filter((value, index, self) => self.indexOf(value) === index)
			.sort((a, b) => new Date(b) - new Date(a));

		setBookingDates(dates);

		// Select the first date by default if none is selected
		if (dates.length > 0 && !selectedDate) {
			setSelectedDate(dates[0]);
		}
	}, [filteredBookings, selectedDate]);

	// When a date is selected, organize equipment by type
	useEffect(() => {
		if (!selectedDate) return;

		// Get all bookings for the selected date
		const dateBookings = filteredBookings.filter(booking => booking.date === selectedDate);

		// Get all equipment IDs from these bookings
		const allEquipmentIds = dateBookings.flatMap(booking => booking.equipmentIds);

		// Get equipment details for each ID
		const equipmentDetails = allEquipmentIds
			.map(id => {
				const item = equipment.find(eq => eq.id === id);
				if (!item) return null;

				// Find which booking this equipment belongs to
				const booking = dateBookings.find(b => b.equipmentIds.includes(id));

				return {
					...item,
					bookingId: booking ? booking.id : null,
					bookingName: booking ? booking.name : null,
					bookingStatus: booking ? booking.status : null,
				};
			})
			.filter(item => item !== null);

		// Group equipment by type
		const groupedByType = equipmentDetails.reduce((acc, item) => {
			const type = item.type || "Uncategorized";
			if (!acc[type]) {
				acc[type] = [];
			}
			acc[type].push(item);
			return acc;
		}, {});

		// Sort equipment within each type
		Object.keys(groupedByType).forEach(type => {
			groupedByType[type].sort((a, b) => a.name.localeCompare(b.name));
		});

		// Sort the groups alphabetically by type
		const sortedGrouped = Object.keys(groupedByType)
			.sort()
			.reduce((acc, key) => {
				acc[key] = groupedByType[key];
				return acc;
			}, {});

		setEquipmentForDate(sortedGrouped);
	}, [selectedDate, filteredBookings, equipment]);

	// Get equipment names for a booking
	const getEquipmentNames = equipmentIds => {
		return equipmentIds
			.map(id => {
				const item = equipment.find(equip => equip.id === id);
				return item ? item.name : "Unknown equipment";
			})
			.join(", ");
	};

	const getEquipmentCount = equipmentIds => {
		return equipmentIds.length;
	};

	const statusOptions = [
		{ value: "all", label: "All Bookings" },
		{ value: "requested", label: "Requested", color: "bg-requested" },
		{ value: "dispatched", label: "Dispatched", color: "bg-dispatched" },
		{ value: "packed", label: "Packed", color: "bg-packed" },
		{ value: "returned", label: "Returned", color: "bg-returned" },
	];

	const getStatusBadge = status => {
		const statusStyles = {
			requested: "bg-requested text-white",
			dispatched: "bg-dispatched text-white",
			packed: "bg-packed text-white",
			returned: "bg-returned text-white",
		};

		return (
			<span
				className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}
			>
				{status.charAt(0).toUpperCase() + status.slice(1)}
			</span>
		);
	};

	// Format date for display
	const formatDate = dateString => {
		const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
		return new Date(dateString).toLocaleDateString("en-US", options);
	};

	// Format date for calendar display
	const formatCalendarDate = dateString => {
		const date = new Date(dateString);
		const options = { month: "short", day: "numeric" };
		return date.toLocaleDateString("en-US", options);
	};

	const isDateToday = dateString => {
		const today = new Date();
		const date = new Date(dateString);
		return today.toDateString() === date.toDateString();
	};

	const isDateSelected = dateString => {
		return selectedDate === dateString;
	};

	const isDateFuture = dateString => {
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Set to beginning of day
		const date = new Date(dateString);
		return date > today;
	};

	const isDatePast = dateString => {
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Set to beginning of day
		const date = new Date(dateString);
		return date < today;
	};

	// Handle updating the status of all equipment from a specific booking
	const handleStatusUpdate = (bookingId, newStatus) => {
		updateBookingStatus(bookingId, newStatus);
	};

	// Get all bookings for the selected date
	const getBookingsForDate = () => {
		if (!selectedDate) return [];
		return filteredBookings.filter(booking => booking.date === selectedDate);
	};

	return (
		<div className="p-4 md:p-6">
			<div className="mb-6">
				<h1 className="text-xl md:text-2xl font-bold mb-1">Booking History</h1>
				<p className="text-gray-500 dark:text-gray-400">View and manage your equipment bookings</p>
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
							onChange={e => setSearchQuery(e.target.value)}
						/>
					</div>
				</div>

				{/* Filter buttons */}
				<div className="flex flex-wrap gap-2">
					{statusOptions.map(option => (
						<button
							key={option.value}
							onClick={() => setFilter(option.value)}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								filter === option.value
									? "bg-primary text-white"
									: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
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
					<p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Bookings</p>
					<p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">{bookings.length}</p>
				</div>
				<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
					<p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Bookings</p>
					<p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
						{bookings.filter(b => isDateFuture(b.date) && b.status !== "returned").length}
					</p>
				</div>
				<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
					<p className="text-sm font-medium text-gray-500 dark:text-gray-400">This Month</p>
					<p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
						{
							bookings.filter(b => {
								const date = new Date(b.date);
								const today = new Date();
								return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
							}).length
						}
					</p>
				</div>
				<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
					<p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Items Booked</p>
					<p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white">
						{bookings.reduce((total, booking) => total + booking.equipmentIds.length, 0)}
					</p>
				</div>
			</div>

			{/* Booking dates selection */}
			<div className="mb-6 overflow-x-auto">
				<div className="inline-flex min-w-full py-2 px-1">
					{bookingDates.length > 0 ? (
						bookingDates.map(date => (
							<button
								key={date}
								onClick={() => setSelectedDate(date)}
								className={`flex flex-col items-center justify-center min-w-[80px] h-20 mx-1 rounded-md transition-colors ${
									isDateSelected(date)
										? "bg-primary text-white"
										: isDateToday(date)
										? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
										: isDateFuture(date)
										? "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-400"
										: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
								}`}
							>
								<span className="text-xs uppercase font-semibold">
									{new Date(date).toLocaleDateString("en-US", { month: "short" })}
								</span>
								<span className="text-2xl font-bold">{new Date(date).getDate()}</span>
								<span className="text-xs">{filteredBookings.filter(b => b.date === date).length} booking(s)</span>
							</button>
						))
					) : (
						<div className="flex items-center justify-center w-full py-6 text-gray-500 dark:text-gray-400">
							No bookings found matching your search
						</div>
					)}
				</div>
			</div>

			{/* Selected date bookings */}
			{selectedDate && (
				<div className="mb-6">
					<div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
						<div className="p-4 border-b border-gray-200 dark:border-gray-700">
							<h2 className="text-lg font-medium">{formatDate(selectedDate)}</h2>
							<div className="mt-2 flex flex-wrap gap-2">
								{getBookingsForDate().map(booking => (
									<div
										key={booking.id}
										className="inline-flex items-center px-3 py-1 rounded-md text-sm bg-gray-100 dark:bg-gray-700"
									>
										<span className="font-medium mr-2">{booking.name}</span>
										{getStatusBadge(booking.status)}
									</div>
								))}
							</div>
						</div>

						{/* Equipment grouped by type */}
						{Object.keys(equipmentForDate).length > 0 ? (
							<div className="divide-y divide-gray-200 dark:divide-gray-700">
								{Object.entries(equipmentForDate).map(([type, items]) => (
									<div key={type} className="p-4">
										<h3 className="font-medium text-lg mb-3 text-gray-900 dark:text-white">{type}</h3>

										<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
											{items.map(item => {
												// Find the booking this equipment belongs to
												const booking = bookings.find(b => b.date === selectedDate && b.equipmentIds.includes(item.id));

												if (!booking) return null;

												return (
													<div
														key={`${booking.id}-${item.id}`}
														className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md p-3"
													>
														<div className="flex justify-between items-start mb-2">
															<div>
																<h4 className="font-medium text-gray-900 dark:text-white">{item.name}</h4>
																<p className="text-sm text-gray-500 dark:text-gray-400">SN: {item.serialNumber}</p>
															</div>
															{getStatusBadge(booking.status)}
														</div>

														<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Booked for:</p>
														<p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{booking.name}</p>

														{booking.notes && (
															<div className="mb-3">
																<p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Notes:</p>
																<p className="text-sm text-gray-700 dark:text-gray-300">{booking.notes}</p>
															</div>
														)}

														<div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between">
															<select
																value={booking.status}
																onChange={e => handleStatusUpdate(booking.id, e.target.value)}
																className="text-sm px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
															>
																{statusOptions.slice(1).map(option => (
																	<option key={option.value} value={option.value}>
																		{option.label}
																	</option>
																))}
															</select>

															<button
																onClick={() => {
																	if (window.confirm("Are you sure you want to delete this booking?")) {
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
											})}
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="p-6 text-center text-gray-500 dark:text-gray-400">No equipment found for this date</div>
						)}
					</div>
				</div>
			)}

			{/* No bookings message */}
			{bookingDates.length === 0 && (
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center text-gray-500 dark:text-gray-400">
					{bookings.length === 0 ? "No bookings yet" : "No bookings found matching your search"}
				</div>
			)}
		</div>
	);
};

export default BookingHistory;
