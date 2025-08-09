import React, { useContext, useState, useEffect } from "react";
import { EquipmentContext } from "../context/EquipmentContext.jsx";
import { ThemeContext } from "../context/ThemeContext.jsx";
import EquipmentForm from "./EquipmentForm.jsx";
import { EnhancedCSVExporter, downloadCSV, getFormattedDate } from "../utils/csvExporter.js";

const EquipmentList = () => {
	const { equipment, deleteEquipment, bookings, getParentEquipment, getChildrenOfEquipment } = useContext(EquipmentContext);
	const { darkMode } = useContext(ThemeContext);
	const [editingId, setEditingId] = useState(null);
	const [showForm, setShowForm] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [groupedEquipment, setGroupedEquipment] = useState({});
	const [expandedGroups, setExpandedGroups] = useState({});
	const [expandedItems, setExpandedItems] = useState({}); // For expanding child items
	const [sortBy, setSortBy] = useState("name"); // Default sort by name
	const [sortOrder, setSortOrder] = useState("asc"); // Default ascending order
	const [showExportMenu, setShowExportMenu] = useState(false);
	const [viewMode, setViewMode] = useState("hierarchical"); // "hierarchical" or "flat"

	// Group equipment by type and sort
	useEffect(() => {
		let equipmentToDisplay = equipment;

		// In hierarchical view, only show parent items (children will be shown nested)
		if (viewMode === "hierarchical") {
			equipmentToDisplay = equipment.filter(item => !item.parentId);
		}

		const filtered = equipmentToDisplay.filter(
			item =>
				item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
				item.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())
		);

		// Sort filtered equipment
		const sorted = [...filtered].sort((a, b) => {
			let comparison = 0;

			if (sortBy === "name") {
				comparison = a.name.localeCompare(b.name);
			} else if (sortBy === "serialNumber") {
				comparison = a.serialNumber.localeCompare(b.serialNumber);
			} else if (sortBy === "purchaseDate") {
				// Handle empty dates (sort to the end)
				if (!a.purchaseDate && !b.purchaseDate) comparison = 0;
				else if (!a.purchaseDate) comparison = 1;
				else if (!b.purchaseDate) comparison = -1;
				else comparison = new Date(a.purchaseDate) - new Date(b.purchaseDate);
			} else if (sortBy === "condition") {
				// Define order: excellent > good > fair > poor > needs-repair
				const conditionOrder = {
					excellent: 1,
					good: 2,
					fair: 3,
					poor: 4,
					"needs-repair": 5,
				};
				comparison = (conditionOrder[a.condition] || 99) - (conditionOrder[b.condition] || 99);
			}

			return sortOrder === "desc" ? -comparison : comparison;
		});

		// Group by type
		const grouped = sorted.reduce((acc, item) => {
			const type = item.type || "Uncategorized";
			if (!acc[type]) {
				acc[type] = [];
			}
			acc[type].push(item);
			return acc;
		}, {});

		// Sort the groups alphabetically by type
		const sortedGrouped = Object.keys(grouped)
			.sort()
			.reduce((acc, key) => {
				acc[key] = grouped[key];
				return acc;
			}, {});

		setGroupedEquipment(sortedGrouped);

		// Initialize expanded state for new groups
		const newExpandedGroups = { ...expandedGroups };
		Object.keys(sortedGrouped).forEach(type => {
			if (newExpandedGroups[type] === undefined) {
				newExpandedGroups[type] = true; // Default expanded
			}
		});
		setExpandedGroups(newExpandedGroups);

		// Initialize expanded state for parent items (expand by default)
		const newExpandedItems = { ...expandedItems };
		equipment.forEach(item => {
			const hasChildren = item.children && item.children.length > 0;
			if (hasChildren && newExpandedItems[item.id] === undefined) {
				newExpandedItems[item.id] = true; // Default expanded for parent items
			}
		});
		setExpandedItems(newExpandedItems);
	}, [equipment, searchQuery, sortBy, sortOrder, viewMode]);

	const toggleGroupExpansion = type => {
		setExpandedGroups({
			...expandedGroups,
			[type]: !expandedGroups[type],
		});
	};

	const toggleItemExpansion = itemId => {
		setExpandedItems({
			...expandedItems,
			[itemId]: !expandedItems[itemId],
		});
	};

	const handleSort = column => {
		if (sortBy === column) {
			// Toggle order if same column
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			// Set new column and reset to ascending
			setSortBy(column);
			setSortOrder("asc");
		}
	};

	// Handle CSV Export
	const handleExportCSV = (exportType) => {
		try {
			const exporter = new EnhancedCSVExporter(equipment, bookings);
			let csvContent = '';
			let filename = '';
			
			switch (exportType) {
				case 'inventory':
					csvContent = exporter.exportMasterInventory();
					filename = `equipment_inventory_${getFormattedDate()}.csv`;
					break;
				case 'usage':
					csvContent = exporter.exportUsageSummary();
					filename = `equipment_usage_summary_${getFormattedDate()}.csv`;
					break;
				case 'bookings':
					csvContent = exporter.exportBookingsLog();
					filename = `equipment_bookings_log_${getFormattedDate()}.csv`;
					break;
				case 'condition':
					csvContent = exporter.exportConditionReport();
					filename = `equipment_condition_report_${getFormattedDate()}.csv`;
					break;
				case 'dashboard':
					csvContent = exporter.exportSummaryDashboard();
					filename = `equipment_dashboard_summary_${getFormattedDate()}.csv`;
					break;
				case 'hierarchical':
					csvContent = exporter.exportHierarchicalStructure();
					filename = `equipment_hierarchical_structure_${getFormattedDate()}.csv`;
					break;
				default:
					console.error('Unknown export type:', exportType);
					return;
			}
			
			downloadCSV(csvContent, filename);
			setShowExportMenu(false);
			
			// Show success message (you could replace this with a toast notification)
			alert(`CSV exported successfully as ${filename}`);
			
		} catch (error) {
			console.error('Error exporting CSV:', error);
			alert('An error occurred while exporting the CSV file. Please try again.');
		}
	};

	// Close export menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (showExportMenu && !event.target.closest('.relative')) {
				setShowExportMenu(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showExportMenu]);

	const getStatusBadge = condition => {
		const statusStyles = {
			excellent: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
			good: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
			fair: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
			poor: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
			"needs-repair": "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
		};

		const displayText = {
			excellent: "Excellent",
			good: "Good",
			fair: "Fair",
			poor: "Poor",
			"needs-repair": "Needs Repair",
		};

		return (
			<span
				className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[condition]}`}
			>
				{displayText[condition] || condition}
			</span>
		);
	};

	// Card view for mobile with nested support
	const EquipmentCard = ({ item, level = 0 }) => {
		const children = viewMode === "hierarchical" ? getChildrenOfEquipment(item.id) : [];
		const hasChildren = children.length > 0;
		const isExpanded = expandedItems[item.id];
		
		return (
			<div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${level > 0 ? 'ml-6 border-l-4 border-l-primary/30' : ''}`} style={{ marginLeft: level > 0 ? `${level * 1.5}rem` : '0' }}>
				<div className="p-4">
					<div className="flex items-center mb-2">
						{hasChildren && viewMode === "hierarchical" && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									toggleItemExpansion(item.id);
								}}
								className="mr-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded flex items-center justify-center border border-gray-300 dark:border-gray-600"
								title="Expand/Collapse components"
							>
								<span className={`transform transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										className="h-3 w-3 text-gray-600 dark:text-gray-400"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fillRule="evenodd"
											d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
											clipRule="evenodd"
										/>
									</svg>
								</span>
							</button>
						)}
						{!hasChildren && viewMode === "hierarchical" && level === 0 && (
							<div className="mr-2 p-1 w-6 h-6"></div>
						)}
						<div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 mr-3">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
								/>
							</svg>
						</div>
						<div className="flex-1">
							<div className="flex items-center">
								<h3 className="font-medium text-gray-900 dark:text-white">{item.name}</h3>
								{hasChildren && (
									<span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
										{children.length} {children.length === 1 ? 'component' : 'components'}
									</span>
								)}
							</div>
							<p className="text-sm text-gray-500 dark:text-gray-400">{item.type}</p>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-2 mb-3">
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400">Serial Number</p>
							<p className="text-sm">{item.serialNumber}</p>
						</div>
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400">Purchase Date</p>
							<p className="text-sm">{item.purchaseDate || "Not specified"}</p>
						</div>
						<div>
							<p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
							<div className="mt-1">{getStatusBadge(item.condition)}</div>
						</div>
					</div>

					<div className="flex justify-end space-x-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
						<button
							onClick={() => {
								setEditingId(item.id);
								setShowForm(true);
							}}
							className="text-primary hover:text-primary-dark text-sm font-medium"
						>
							Edit
						</button>
						<button
							onClick={() => {
								if (window.confirm(`Are you sure you want to delete ${item.name}?${hasChildren ? ' This will also affect its components.' : ''}`)) {
									deleteEquipment(item.id);
								}
							}}
							className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 text-sm font-medium"
						>
							Delete
						</button>
					</div>
				</div>

				{/* Render children */}
				{hasChildren && viewMode === "hierarchical" && isExpanded && (
					<div className="pb-4">
						{children.map(child => (
							<EquipmentCard key={child.id} item={child} level={level + 1} />
						))}
					</div>
				)}
			</div>
		);
	};

	// Table row component with hierarchical support
	const EquipmentTableRows = ({ item, level = 0 }) => {
		const children = viewMode === "hierarchical" ? getChildrenOfEquipment(item.id) : [];
		const hasChildren = children.length > 0;
		const isExpanded = expandedItems[item.id];

		return (
			<>
				<tr className="hover:bg-gray-50 dark:hover:bg-gray-750">
					<td className="px-6 py-4 whitespace-nowrap">
						<div className="flex items-center" style={{ paddingLeft: level > 0 ? `${level * 1.5}rem` : '0' }}>
							{hasChildren && viewMode === "hierarchical" && (
								<button
									onClick={(e) => {
										e.stopPropagation();
										toggleItemExpansion(item.id);
									}}
									className="mr-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center justify-center"
									title="Expand/Collapse components"
								>
									<span className={`transform transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`}>
										<svg
											xmlns="http://www.w3.org/2000/svg"
											className="h-4 w-4 text-gray-500 hover:text-gray-700"
											viewBox="0 0 20 20"
											fill="currentColor"
										>
											<path
												fillRule="evenodd"
												d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
												clipRule="evenodd"
											/>
										</svg>
									</span>
								</button>
							)}
							{!hasChildren && viewMode === "hierarchical" && (
								<div className="mr-2 p-1 w-6 h-6"></div>
							)}
							{level > 0 && (
								<div className="w-4 h-4 mr-2 flex items-center justify-center">
									<div className="w-2 h-2 border-l-2 border-b-2 border-gray-300 dark:border-gray-600"></div>
								</div>
							)}
							<div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-6 w-6"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
									/>
								</svg>
							</div>
							<div className="ml-4">
								<div className="flex items-center">
									<div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
									{hasChildren && (
										<span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
											{children.length}
										</span>
									)}
								</div>
							</div>
						</div>
					</td>
					<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
						{item.serialNumber}
					</td>
					<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
						{item.purchaseDate || "Not specified"}
					</td>
					<td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(item.condition)}</td>
					<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
						<button
							onClick={() => {
								setEditingId(item.id);
								setShowForm(true);
							}}
							className="text-primary hover:text-primary-dark mr-4"
						>
							Edit
						</button>
						<button
							onClick={() => {
								if (window.confirm(`Are you sure you want to delete ${item.name}?${hasChildren ? ' This will also affect its components.' : ''}`)) {
									deleteEquipment(item.id);
								}
							}}
							className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
						>
							Delete
						</button>
					</td>
				</tr>
				{/* Render children rows */}
				{hasChildren && viewMode === "hierarchical" && isExpanded && 
					children.map(child => (
						<EquipmentTableRows key={child.id} item={child} level={level + 1} />
					))
				}
			</>
		);
	};

	// Group header for collapsible groups
	const GroupHeader = ({ type, count, isExpanded }) => (
		<div
			className="flex items-center justify-between py-2 px-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
			onClick={() => toggleGroupExpansion(type)}
		>
			<div className="flex items-center">
				<span className={`transform transition-transform ${isExpanded ? "rotate-90" : ""}`}>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-5 w-5 text-gray-400"
						viewBox="0 0 20 20"
						fill="currentColor"
					>
						<path
							fillRule="evenodd"
							d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
							clipRule="evenodd"
						/>
					</svg>
				</span>
				<h3 className="text-lg font-medium text-gray-900 dark:text-white ml-2">{type}</h3>
			</div>
			<span className="text-sm text-gray-500 dark:text-gray-400">{count} items</span>
		</div>
	);

	return (
		<div className="p-4 md:p-6">
			<div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
				<div>
					<h1 className="text-xl md:text-2xl font-bold mb-1">Equipment Inventory</h1>
					<p className="text-gray-500 dark:text-gray-400">Manage your equipment inventory</p>
				</div>
				<div className="flex flex-col sm:flex-row gap-2">
					{/* View Mode Toggle */}
					<div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
						<button
							onClick={() => setViewMode("hierarchical")}
							className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
								viewMode === "hierarchical"
									? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
									: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
							}`}
						>
							Hierarchical
						</button>
						<button
							onClick={() => setViewMode("flat")}
							className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
								viewMode === "flat"
									? "bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm"
									: "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
							}`}
						>
							Flat View
						</button>
					</div>
					{/* Export Dropdown */}
					<div className="relative">
						<button
							className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
							onClick={() => setShowExportMenu(!showExportMenu)}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="-ml-1 mr-2 h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
							Export CSV
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="ml-2 -mr-1 h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
							</svg>
						</button>

						{showExportMenu && (
							<div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
								<div className="py-1">
									<button
										onClick={() => handleExportCSV('inventory')}
										className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										<svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
										</svg>
										Master Inventory
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
										onClick={() => handleExportCSV('bookings')}
										className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										<svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m0 0V5a1 1 0 011 1v6a1 1 0 01-1 1H9a1 1 0 01-1-1V6a1 1 0 011-1h6z" />
										</svg>
										Bookings Log
									</button>
									<button
										onClick={() => handleExportCSV('condition')}
										className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										<svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
										</svg>
										Condition Report
									</button>
									<button
										onClick={() => handleExportCSV('dashboard')}
										className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										<svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
										</svg>
										Summary Dashboard
									</button>
									<button
										onClick={() => handleExportCSV('hierarchical')}
										className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
									>
										<svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
										</svg>
										Hierarchical Structure
									</button>
								</div>
							</div>
						)}
					</div>

					<button
						className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
						onClick={() => {
							setEditingId(null);
							setShowForm(true);
						}}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="-ml-1 mr-2 h-5 w-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
						</svg>
						Add Equipment
					</button>
				</div>
			</div>

			{showForm && (
				<EquipmentForm
					editingId={editingId}
					onClose={() => {
						setEditingId(null);
						setShowForm(false);
					}}
				/>
			)}

			<div className="mb-4">
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
						placeholder="Search equipment..."
						className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white dark:bg-gray-800 dark:border-gray-700 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
						value={searchQuery}
						onChange={e => setSearchQuery(e.target.value)}
					/>
				</div>
			</div>

			{/* Equipment summary */}
			<div className="mb-6">
				<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700">
					<h3 className="font-medium text-lg mb-2">Equipment Summary</h3>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Total Equipment</p>
							<p className="text-xl font-semibold">{equipment.length}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Parent Items</p>
							<p className="text-xl font-semibold">{getParentEquipment().length}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Categories</p>
							<p className="text-xl font-semibold">{Object.keys(groupedEquipment).length}</p>
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Needs Repair</p>
							<p className="text-xl font-semibold">
								{equipment.filter(item => item.condition === "needs-repair").length}
							</p>
						</div>
						<div>
							<p className="text-sm text-gray-500 dark:text-gray-400">Excellent Condition</p>
							<p className="text-xl font-semibold">{equipment.filter(item => item.condition === "excellent").length}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Card View */}
			<div className="md:hidden space-y-6">
				{Object.keys(groupedEquipment).length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
						{equipment.length === 0 ? "No equipment added yet" : "No equipment found matching your search"}
					</div>
				) : (
					Object.entries(groupedEquipment).map(([type, items]) => (
						<div key={type} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
							<GroupHeader type={type} count={items.length} isExpanded={expandedGroups[type]} />

							{expandedGroups[type] && (
								<div className="p-4 space-y-4">
									{items.map(item => (
										<EquipmentCard key={item.id} item={item} level={0} />
									))}
								</div>
							)}
						</div>
					))
				)}
			</div>

			{/* Desktop Table View */}
			<div className="hidden md:block space-y-6">
				{Object.keys(groupedEquipment).length === 0 ? (
					<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
						{equipment.length === 0 ? "No equipment added yet" : "No equipment found matching your search"}
					</div>
				) : (
					Object.entries(groupedEquipment).map(([type, items]) => (
						<div
							key={type}
							className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md border border-gray-200 dark:border-gray-700"
						>
							<GroupHeader type={type} count={items.length} isExpanded={expandedGroups[type]} />

							{expandedGroups[type] && (
								<div className="overflow-x-auto">
									<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
										<thead className="bg-gray-50 dark:bg-gray-900">
											<tr>
												<th
													scope="col"
													className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
													onClick={() => handleSort("name")}
												>
													<div className="flex items-center">
														Name
														{sortBy === "name" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
													</div>
												</th>
												<th
													scope="col"
													className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
													onClick={() => handleSort("serialNumber")}
												>
													<div className="flex items-center">
														Serial Number
														{sortBy === "serialNumber" && (
															<span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
														)}
													</div>
												</th>
												<th
													scope="col"
													className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
													onClick={() => handleSort("purchaseDate")}
												>
													<div className="flex items-center">
														Purchase Date
														{sortBy === "purchaseDate" && (
															<span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
														)}
													</div>
												</th>
												<th
													scope="col"
													className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer"
													onClick={() => handleSort("condition")}
												>
													<div className="flex items-center">
														Status
														{sortBy === "condition" && <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>}
													</div>
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
											{items.map(item => (
												<EquipmentTableRows key={item.id} item={item} level={0} />
											))}
										</tbody>
									</table>
								</div>
							)}
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default EquipmentList;
