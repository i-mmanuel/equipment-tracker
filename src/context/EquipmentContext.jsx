import React, { createContext, useState, useEffect } from "react";

export const EquipmentContext = createContext();

export const EquipmentProvider = ({ children }) => {
	// Mock database with localStorage
	const [equipment, setEquipment] = useState([]);
	const [bookings, setBookings] = useState([]);

	// Load data from localStorage on initial render
	useEffect(() => {
		refreshData();
	}, []);

	// Save data to localStorage whenever it changes
	useEffect(() => {
		localStorage.setItem("equipment", JSON.stringify(equipment));
	}, [equipment]);

	useEffect(() => {
		localStorage.setItem("bookings", JSON.stringify(bookings));
	}, [bookings]);

	// CRUD operations for equipment
	const addEquipment = newEquipment => {
		// Create a timestamp for items without purchase date
		const purchaseDate = newEquipment.purchaseDate || new Date().toISOString().split("T")[0];

		const equipmentToAdd = {
			...newEquipment,
			id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // More unique ID
			purchaseDate,
		};

		setEquipment(prevEquipment => [...prevEquipment, equipmentToAdd]);

		// Return the new equipment ID
		return equipmentToAdd.id;
	};

	const updateEquipment = (id, updatedEquipment) => {
		setEquipment(equipment.map(item => (item.id === id ? { ...updatedEquipment, id } : item)));
	};

	const deleteEquipment = id => {
		setEquipment(equipment.filter(item => item.id !== id));
		// Also remove any bookings for this equipment
		setBookings(bookings.filter(booking => booking.equipmentIds.indexOf(id) === -1));
	};

	// Booking operations
	const addBooking = newBooking => {
		setBookings([...bookings, { ...newBooking, id: Date.now().toString(), status: "requested" }]);
	};

	const updateBookingStatus = (bookingId, newStatus) => {
		setBookings(bookings.map(booking => (booking.id === bookingId ? { ...booking, status: newStatus } : booking)));
	};

	const deleteBooking = id => {
		setBookings(bookings.filter(booking => booking.id !== id));
	};

	// Function to refresh data from localStorage
	const refreshData = () => {
		try {
			const storedEquipment = localStorage.getItem("equipment");
			const storedBookings = localStorage.getItem("bookings");

			console.log("Refreshing data from localStorage");

			if (storedEquipment) {
				const parsedEquipment = JSON.parse(storedEquipment);
				console.log(`Found ${parsedEquipment.length} equipment items in localStorage`);
				setEquipment(parsedEquipment);
			} else {
				console.log("No equipment found in localStorage");
				setEquipment([]);
			}

			if (storedBookings) {
				const parsedBookings = JSON.parse(storedBookings);
				console.log(`Found ${parsedBookings.length} bookings in localStorage`);
				setBookings(parsedBookings);
			} else {
				console.log("No bookings found in localStorage");
				setBookings([]);
			}
		} catch (error) {
			console.error("Error refreshing data from localStorage:", error);
			setEquipment([]);
			setBookings([]);
		}
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
				refreshData,
			}}
		>
			{children}
		</EquipmentContext.Provider>
	);
};
