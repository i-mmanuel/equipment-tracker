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
			parentId: newEquipment.parentId || null, // Parent relationship
			children: [], // Array of child equipment IDs
		};

		setEquipment(prevEquipment => {
			const updatedEquipment = [...prevEquipment, equipmentToAdd];
			
			// If this item has a parent, update parent's children array
			if (equipmentToAdd.parentId) {
				return updatedEquipment.map(item => 
					item.id === equipmentToAdd.parentId 
						? { ...item, children: [...(item.children || []), equipmentToAdd.id] }
						: item
				);
			}
			
			return updatedEquipment;
		});

		// Return the new equipment ID
		return equipmentToAdd.id;
	};

	const updateEquipment = (id, updatedEquipment) => {
		setEquipment(prevEquipment => {
			const currentItem = prevEquipment.find(item => item.id === id);
			const oldParentId = currentItem?.parentId;
			const newParentId = updatedEquipment.parentId;
			
			let updatedList = prevEquipment.map(item => 
				item.id === id ? { ...updatedEquipment, id, children: currentItem?.children || [] } : item
			);
			
			// Handle parent changes
			if (oldParentId !== newParentId) {
				// Remove from old parent's children
				if (oldParentId) {
					updatedList = updatedList.map(item =>
						item.id === oldParentId
							? { ...item, children: (item.children || []).filter(childId => childId !== id) }
							: item
					);
				}
				
				// Add to new parent's children
				if (newParentId) {
					updatedList = updatedList.map(item =>
						item.id === newParentId
							? { ...item, children: [...(item.children || []), id] }
							: item
					);
				}
			}
			
			return updatedList;
		});
	};

	const deleteEquipment = id => {
		setEquipment(prevEquipment => {
			const itemToDelete = prevEquipment.find(item => item.id === id);
			
			let updatedList = prevEquipment.filter(item => item.id !== id);
			
			// Remove from parent's children array if it has a parent
			if (itemToDelete?.parentId) {
				updatedList = updatedList.map(item =>
					item.id === itemToDelete.parentId
						? { ...item, children: (item.children || []).filter(childId => childId !== id) }
						: item
				);
			}
			
			// Handle children of deleted item
			const childrenToUpdate = itemToDelete?.children || [];
			if (childrenToUpdate.length > 0) {
				// Option 1: Move children to top level (no parent)
				updatedList = updatedList.map(item => 
					childrenToUpdate.includes(item.id) 
						? { ...item, parentId: null }
						: item
				);
				
				// Alternative Option 2: Delete children as well (uncomment if preferred)
				// updatedList = updatedList.filter(item => !childrenToUpdate.includes(item.id));
			}
			
			return updatedList;
		});
		
		// Also remove any bookings for this equipment and its children
		setBookings(bookings.filter(booking => 
			!booking.equipmentIds.some(equipId => 
				equipId === id || (equipment.find(item => item.id === id)?.children || []).includes(equipId)
			)
		));
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

	// Utility functions for hierarchical data
	const getParentEquipment = () => {
		return equipment.filter(item => !item.parentId);
	};

	const getChildrenOfEquipment = (parentId) => {
		return equipment.filter(item => item.parentId === parentId);
	};

	const getEquipmentHierarchy = () => {
		const hierarchy = [];
		const parentItems = equipment.filter(item => !item.parentId);
		
		parentItems.forEach(parent => {
			const children = equipment.filter(child => child.parentId === parent.id);
			hierarchy.push({
				...parent,
				children: children
			});
		});
		
		return hierarchy;
	};

	const canHaveParent = (itemId, potentialParentId) => {
		// Prevent circular dependencies
		if (itemId === potentialParentId) return false;
		
		const item = equipment.find(eq => eq.id === itemId);
		if (!item) return false;
		
		// Check if potentialParent is already a child of item (would create a circle)
		const isDescendant = (parentId, searchId) => {
			const children = equipment.filter(eq => eq.parentId === parentId);
			for (const child of children) {
				if (child.id === searchId) return true;
				if (isDescendant(child.id, searchId)) return true;
			}
			return false;
		};
		
		return !isDescendant(itemId, potentialParentId);
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
				getParentEquipment,
				getChildrenOfEquipment,
				getEquipmentHierarchy,
				canHaveParent,
			}}
		>
			{children}
		</EquipmentContext.Provider>
	);
};
