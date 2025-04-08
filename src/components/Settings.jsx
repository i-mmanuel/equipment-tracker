import React, { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { EquipmentContext } from "../context/EquipmentContext.jsx";
import CSVImport from "./CSVImport.jsx";

const Settings = () => {
	const { darkMode, toggleTheme } = useContext(ThemeContext);
	const { equipment, bookings, refreshData } = useContext(EquipmentContext);
	const [notifications, setNotifications] = useState(true);
	const [emailNotifications, setEmailNotifications] = useState(false);
	const [importSuccess, setImportSuccess] = useState(null);

	const clearAllData = () => {
		if (
			window.confirm("Are you sure you want to clear all equipment and booking data? This action cannot be undone.")
		) {
			localStorage.removeItem("equipment");
			localStorage.removeItem("bookings");
			refreshData();
		}
	};

	const handleImportComplete = (importedCount, errors) => {
		if (errors.length === 0) {
			setImportSuccess(`Successfully imported ${importedCount} equipment items.`);
		} else {
			setImportSuccess(`Imported ${importedCount} equipment items with ${errors.length} errors.`);
		}

		// Refresh the equipment list
		refreshData();

		// Clear success message after 5 seconds
		setTimeout(() => {
			setImportSuccess(null);
		}, 5000);
	};

	const SettingRow = ({ title, description, children }) => (
		<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
			<div className="mb-2 sm:mb-0">
				<p className="font-medium text-gray-900 dark:text-white">{title}</p>
				<p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
			</div>
			<div className="sm:col-span-2">{children}</div>
		</div>
	);

	return (
		<div className="p-4 md:p-6">
			<div className="mb-6">
				<h1 className="text-xl md:text-2xl font-bold mb-1">Settings</h1>
				<p className="text-gray-500 dark:text-gray-400">Manage your application preferences</p>
			</div>

			<div className="max-w-3xl">
				{importSuccess && (
					<div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md">
						{importSuccess}
					</div>
				)}

				<div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
					<div className="divide-y divide-gray-200 dark:divide-gray-700">
						{/* Data Import Section */}
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Data Import/Export</h3>

							<CSVImport onImportComplete={handleImportComplete} />

							<div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
								<h3 className="text-lg font-medium mb-4">Export Data</h3>
								<div className="flex flex-col sm:flex-row gap-2">
									<button
										className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
										onClick={() => {
											const data = JSON.stringify(equipment, null, 2);
											const blob = new Blob([data], { type: "application/json" });
											const url = URL.createObjectURL(blob);
											const a = document.createElement("a");
											a.href = url;
											a.download = "equipment_data.json";
											a.click();
										}}
									>
										Export Equipment (JSON)
									</button>
									<button
										className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
										onClick={() => {
											const headers = ["name", "type", "serialNumber", "condition", "purchaseDate", "notes"];

											// Create CSV content
											let csvContent = headers.join(",") + "\n";

											// Add each equipment as a row
											equipment.forEach(item => {
												const row = [
													`"${(item.name || "").replace(/"/g, '""')}"`,
													`"${(item.type || "").replace(/"/g, '""')}"`,
													`"${(item.serialNumber || "").replace(/"/g, '""')}"`,
													`"${(item.condition || "").replace(/"/g, '""')}"`,
													`"${(item.purchaseDate || "").replace(/"/g, '""')}"`,
													`"${(item.notes || "").replace(/"/g, '""')}"`,
												];
												csvContent += row.join(",") + "\n";
											});

											// Create and download the file
											const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
											const url = URL.createObjectURL(blob);
											const a = document.createElement("a");
											a.href = url;
											a.download = "equipment_data.csv";
											a.click();
										}}
									>
										Export Equipment (CSV)
									</button>
								</div>
							</div>
						</div>

						{/* Appearance */}
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Appearance</h3>

							<SettingRow
								title="Dark Mode"
								description={darkMode ? "Currently using dark mode" : "Currently using light mode"}
							>
								<div className="flex justify-end">
									<button
										onClick={toggleTheme}
										className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
									>
										{darkMode ? "Switch to Light" : "Switch to Dark"}
									</button>
								</div>
							</SettingRow>
						</div>

						{/* Notifications */}
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Notifications</h3>

							<SettingRow title="In-app Notifications" description="Receive notifications about status changes">
								<div className="flex justify-end">
									<label className="inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={notifications}
											onChange={() => setNotifications(!notifications)}
											className="sr-only peer"
										/>
										<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
									</label>
								</div>
							</SettingRow>

							<SettingRow title="Email Notifications" description="Receive email updates about your bookings">
								<div className="flex justify-end">
									<label className="inline-flex items-center cursor-pointer">
										<input
											type="checkbox"
											checked={emailNotifications}
											onChange={() => setEmailNotifications(!emailNotifications)}
											className="sr-only peer"
										/>
										<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
									</label>
								</div>
							</SettingRow>
						</div>

						{/* Data Management */}
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Data Management</h3>

							<div className="space-y-6">
								<SettingRow title="Current Data" description="Summary of your stored data">
									<div>
										<p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
											<span className="font-medium text-gray-700 dark:text-gray-300">{equipment.length}</span> equipment
											items
										</p>
										<p className="text-sm text-gray-500 dark:text-gray-400">
											<span className="font-medium text-gray-700 dark:text-gray-300">{bookings.length}</span> bookings
										</p>
									</div>
								</SettingRow>

								<SettingRow title="Clear All Data" description="Remove all your equipment and booking data">
									<div className="flex justify-end">
										<button
											className="inline-flex items-center justify-center px-4 py-2 border border-red-300 dark:border-red-700 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
											onClick={clearAllData}
										>
											Clear All Data
										</button>
									</div>
								</SettingRow>
							</div>
						</div>

						{/* About */}
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">About</h3>

							<div className="py-2">
								<p className="text-sm text-gray-500 dark:text-gray-400">
									<span className="font-bold text-gray-700 dark:text-gray-300">Equipment Tracker</span> v1.0.0
								</p>
								<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
									A simple application to track equipment inventory and manage bookings. Built with React and Tailwind
									CSS.
								</p>
								<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Data is stored locally in your browser.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Settings;
