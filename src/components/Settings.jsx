import React, { useContext, useState, useEffect } from "react";
import { ThemeContext } from "../context/ThemeContext.jsx";
import { EquipmentContext } from "../context/EquipmentContext.jsx";
import CSVImport from "./CSVImport.jsx";
import LogoShowcase from "./LogoShowcase.jsx";
import { EnhancedCSVExporter, downloadCSV, getFormattedDate } from "../utils/csvExporter.js";

const Settings = () => {
	const { darkMode, toggleTheme } = useContext(ThemeContext);
	const { equipment, bookings, refreshData } = useContext(EquipmentContext);
	const [notifications, setNotifications] = useState(true);
	const [emailNotifications, setEmailNotifications] = useState(false);
	const [importSuccess, setImportSuccess] = useState(null);
	const [showLogoShowcase, setShowLogoShowcase] = useState(false);
	const [showExportDropdown, setShowExportDropdown] = useState(false);

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

	// Handle export dropdown
	const handleExportCSV = (exportType) => {
		try {
			const exporter = new EnhancedCSVExporter(equipment, bookings);
			let csvContent = '';
			let filename = '';
			
			switch (exportType) {
				case 'inventory':
					csvContent = exporter.exportMasterInventory();
					filename = `equipment_hierarchical_inventory_${getFormattedDate()}.csv`;
					break;
				case 'structure':
					csvContent = exporter.exportHierarchicalStructure();
					filename = `equipment_hierarchical_structure_${getFormattedDate()}.csv`;
					break;
				case 'usage':
					csvContent = exporter.exportUsageSummary();
					filename = `equipment_usage_summary_${getFormattedDate()}.csv`;
					break;
				case 'flat':
					// Legacy flat export
					const headers = ["name", "type", "serialNumber", "condition", "purchaseDate", "notes", "parentId"];
					let flatCsvContent = headers.join(",") + "\n";
					equipment.forEach(item => {
						const row = [
							`"${(item.name || "").replace(/"/g, '""')}"`,
							`"${(item.type || "").replace(/"/g, '""')}"`,
							`"${(item.serialNumber || "").replace(/"/g, '""')}"`,
							`"${(item.condition || "").replace(/"/g, '""')}"`,
							`"${(item.purchaseDate || "").replace(/"/g, '""')}"`,
							`"${(item.notes || "").replace(/"/g, '""')}"`,
							`"${(item.parentId || "").replace(/"/g, '""')}"`,
						];
						flatCsvContent += row.join(",") + "\n";
					});
					csvContent = flatCsvContent;
					filename = `equipment_flat_export_${getFormattedDate()}.csv`;
					break;
				default:
					console.error('Unknown export type:', exportType);
					return;
			}
			
			downloadCSV(csvContent, filename);
			setShowExportDropdown(false);
			
		} catch (error) {
			console.error('Error exporting CSV:', error);
			alert('Error exporting CSV. Please try again.');
		}
	};

	// Close export dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (showExportDropdown && !event.target.closest('.relative')) {
				setShowExportDropdown(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showExportDropdown]);

	const SettingRow = ({ title, description, children }) => (
		<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4">
			<div className="mb-2 sm:mb-0">
				<p className="font-medium text-gray-900 dark:text-white">{title}</p>
				<p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
			</div>
			<div className="sm:col-span-2">{children}</div>
		</div>
	);

	// If showing logo showcase, render it instead of settings
	if (showLogoShowcase) {
		return (
			<div>
				<div className="p-4 md:p-6">
					<button 
						onClick={() => setShowLogoShowcase(false)}
						className="mb-4 inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
					>
						← Back to Settings
					</button>
				</div>
				<LogoShowcase />
			</div>
		);
	}

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
									<div className="relative">
										<button
											className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
											onClick={() => setShowExportDropdown(!showExportDropdown)}
										>
											Export Equipment (CSV)
											<svg className="ml-2 -mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
												<path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
											</svg>
										</button>
										
										{showExportDropdown && (
											<div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
												<div className="py-1">
													<button
														onClick={() => handleExportCSV('inventory')}
														className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
													>
														<svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
														</svg>
														Hierarchical Inventory (Recommended)
													</button>
													<button
														onClick={() => handleExportCSV('structure')}
														className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
													>
														<svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
														</svg>
														Visual Tree Structure
													</button>
													<button
														onClick={() => handleExportCSV('usage')}
														className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
													>
														<svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
														</svg>
														Usage Summary
													</button>
													<button
														onClick={() => handleExportCSV('flat')}
														className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 border-t border-gray-200 dark:border-gray-600"
													>
														<svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
														</svg>
														Legacy Flat Format
													</button>
												</div>
											</div>
										)}
									</div>
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

						{/* Logo Showcase */}
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-4">Brand & Logo</h3>
							
							<SettingRow title="Logo Variations" description="View all available logo designs for your application">
								<div className="flex justify-end">
									<button
										onClick={() => setShowLogoShowcase(true)}
										className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
									>
										View Logo Showcase
									</button>
								</div>
							</SettingRow>
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
