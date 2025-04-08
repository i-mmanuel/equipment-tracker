import React, { useContext, useState, useEffect } from "react";
import { EquipmentContext } from "../context/EquipmentContext.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";

const EquipmentForm = ({ editingId, onClose }) => {
	const { addEquipment, updateEquipment, equipment } = useContext(EquipmentContext);
	const { darkMode } = useContext(ThemeContext);

	// Default form state
	const initialState = {
		name: "",
		type: "",
		serialNumber: "",
		condition: "good",
		purchaseDate: "",
		notes: "",
	};

	const [formData, setFormData] = useState(initialState);
	const [customType, setCustomType] = useState("");
	const [isCustomType, setIsCustomType] = useState(false);
	const [availableTypes, setAvailableTypes] = useState([]);

	// Extract unique equipment types
	useEffect(() => {
		const types = equipment
			.map(item => item.type)
			.filter(type => type) // Remove nulls/undefined
			.filter((value, index, self) => self.indexOf(value) === index) // Get unique values
			.sort(); // Sort alphabetically

		setAvailableTypes(types);
	}, [equipment]);

	// If editing, populate form with equipment data
	useEffect(() => {
		if (editingId) {
			const equipmentToEdit = equipment.find(item => item.id === editingId);
			if (equipmentToEdit) {
				setFormData(equipmentToEdit);
				// Check if the type is custom
				if (equipmentToEdit.type && !availableTypes.includes(equipmentToEdit.type)) {
					setIsCustomType(true);
					setCustomType(equipmentToEdit.type);
				}
			}
		}
	}, [editingId, equipment, availableTypes]);

	const handleChange = e => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const handleTypeChange = e => {
		const value = e.target.value;

		if (value === "custom") {
			// Custom type selected
			setIsCustomType(true);
			// Don't update type in formData yet
			setCustomType("");
		} else {
			// Regular type selected
			setIsCustomType(false);
			setFormData({
				...formData,
				type: value,
			});
		}
	};

	const handleCustomTypeChange = e => {
		const value = e.target.value;
		setCustomType(value);
		setFormData({
			...formData,
			type: value,
		});
	};

	const handleSubmit = e => {
		e.preventDefault();

		if (editingId) {
			updateEquipment(editingId, formData);
		} else {
			addEquipment(formData);
		}

		setFormData(initialState);
		setIsCustomType(false);
		setCustomType("");
		onClose();
	};

	return (
		<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
			<div className="relative max-w-md w-full rounded-md bg-white dark:bg-gray-800 shadow-lg">
				{/* Mobile swipe indicator */}
				<div className="md:hidden w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded mx-auto mt-3"></div>

				<div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
					<h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
						{editingId ? "Edit Equipment" : "Add New Equipment"}
					</h3>
					<button onClick={onClose} className="text-gray-400 hover:text-gray-500 focus:outline-none">
						<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="p-4">
					<div className="space-y-4">
						<div>
							<label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Name
							</label>
							<input
								type="text"
								id="name"
								name="name"
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								value={formData.name}
								onChange={handleChange}
								required
							/>
						</div>

						<div>
							<label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Type
							</label>
							<select
								id="type"
								name="type"
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								value={isCustomType ? "custom" : formData.type}
								onChange={handleTypeChange}
								required
							>
								<option value="">Select a type</option>
								{availableTypes.map(type => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
								<option value="custom">Add new type...</option>
							</select>

							{/* Custom type input that appears when "Add new type" is selected */}
							{isCustomType && (
								<div className="mt-2">
									<input
										type="text"
										id="customType"
										name="customType"
										placeholder="Enter new equipment type"
										className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
										value={customType}
										onChange={handleCustomTypeChange}
										required
									/>
								</div>
							)}
						</div>

						<div>
							<label htmlFor="serialNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Serial Number
							</label>
							<input
								type="text"
								id="serialNumber"
								name="serialNumber"
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								value={formData.serialNumber}
								onChange={handleChange}
								required
							/>
						</div>

						<div>
							<label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Purchase Date
							</label>
							<input
								type="date"
								id="purchaseDate"
								name="purchaseDate"
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								value={formData.purchaseDate || ""}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor="condition" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Condition
							</label>
							<select
								id="condition"
								name="condition"
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								value={formData.condition}
								onChange={handleChange}
								required
							>
								<option value="excellent">Excellent</option>
								<option value="good">Good</option>
								<option value="fair">Fair</option>
								<option value="poor">Poor</option>
								<option value="needs-repair">Needs Repair</option>
							</select>
						</div>

						<div>
							<label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
								Notes
							</label>
							<textarea
								id="notes"
								name="notes"
								rows="3"
								className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white"
								value={formData.notes || ""}
								onChange={handleChange}
							/>
						</div>
					</div>

					<div className="flex justify-end gap-2 mt-6 pt-4 border-t dark:border-gray-700">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
						>
							{editingId ? "Update" : "Add"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EquipmentForm;
