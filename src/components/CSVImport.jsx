import React, { useState, useContext } from "react";
import { EquipmentContext } from "../context/EquipmentContext.jsx";
import Papa from "papaparse";

const CSVImport = ({ onImportComplete }) => {
	const { addEquipment, refreshData } = useContext(EquipmentContext);
	const [file, setFile] = useState(null);
	const [importing, setImporting] = useState(false);
	const [error, setError] = useState(null);
	const [progress, setProgress] = useState(0);
	const [preview, setPreview] = useState(null);

	const handleFileChange = e => {
		const selectedFile = e.target.files[0];
		setFile(selectedFile);
		setError(null);

		// Generate preview of the file
		if (selectedFile) {
			const reader = new FileReader();
			reader.onload = event => {
				try {
					Papa.parse(event.target.result, {
						header: true,
						skipEmptyLines: true,
						preview: 5, // Show first 5 rows
						complete: results => {
							setPreview(results);
						},
						error: error => {
							setError(`Error parsing CSV: ${error}`);
							setPreview(null);
						},
					});
				} catch (err) {
					setError(`Error reading file: ${err.message}`);
					setPreview(null);
				}
			};
			reader.readAsText(selectedFile);
		} else {
			setPreview(null);
		}
	};

	const handleImport = () => {
		if (!file) {
			setError("Please select a file to import");
			return;
		}

		setImporting(true);
		setProgress(0);
		setError(null);

		try {
			const reader = new FileReader();

			reader.onload = event => {
				try {
					Papa.parse(event.target.result, {
						header: true,
						skipEmptyLines: true,
						dynamicTyping: true,
						complete: results => {
							if (results.errors.length > 0) {
								setError(`CSV parsing errors: ${results.errors.map(e => e.message).join(", ")}`);
								setImporting(false);
								return;
							}

							const { data } = results;

							// Check for required columns (flexible for different export formats)
							const headers = Object.keys(data[0] || {});
							const lowerHeaders = headers.map(h => h.toLowerCase().replace(/[^a-z]/g, ''));
							
							// Required: some form of name, type, and serial number
							const hasName = lowerHeaders.some(h => 
								h.includes('name') || h.includes('equipmentstructure')
							);
							const hasType = lowerHeaders.includes('type');
							const hasSerial = lowerHeaders.some(h => 
								h.includes('serial') || h.includes('serialnumber')
							);

							const missingFields = [];
							if (!hasName) missingFields.push('name/item_name/equipment_structure');
							if (!hasType) missingFields.push('type');
							if (!hasSerial) missingFields.push('serialNumber/serial');

							if (missingFields.length > 0) {
								setError(`Missing required columns: ${missingFields.join(", ")}`);
								setImporting(false);
								return;
							}

							// Enhanced import handling for hierarchical CSV formats
							let importedCount = 0;
							const errors = [];

							// Get existing equipment from localStorage
							const storedEquipment = localStorage.getItem("equipment");
							let equipmentList = storedEquipment ? JSON.parse(storedEquipment) : [];

							// Detect CSV format type
							const isHierarchicalFormat = headers.some(h => 
								h.toLowerCase().includes('equipment_structure') || 
								h.toLowerCase().includes('item_name') ||
								h.toLowerCase().includes('parent_item')
							);

							// Create mapping for different CSV formats
							const createColumnMap = (headers) => {
								const columnMap = {};
								headers.forEach(header => {
									const lowerHeader = header.toLowerCase().replace(/[^a-z]/g, '');
									
									// Name field variations
									if (lowerHeader === "name" || lowerHeader === "itemname" || lowerHeader === "equipmentstructure") {
										columnMap.name = header;
									}
									// Type field variations
									if (lowerHeader === "type") columnMap.type = header;
									// Serial number variations
									if (lowerHeader === "serialnumber" || lowerHeader === "serial") columnMap.serialNumber = header;
									// Condition variations
									if (lowerHeader === "condition") columnMap.condition = header;
									// Purchase date variations
									if (lowerHeader === "purchasedate" || lowerHeader === "date") columnMap.purchaseDate = header;
									// Notes variations
									if (lowerHeader === "notes") columnMap.notes = header;
									// Parent ID variations
									if (lowerHeader === "parentid" || lowerHeader === "parent" || lowerHeader === "parentitem" || lowerHeader === "parentequipment") {
										columnMap.parentId = header;
									}
								});
								return columnMap;
							};

							const columnMap = createColumnMap(headers);

							// Helper function to clean equipment names from visual formatting
							const cleanEquipmentName = (name) => {
								if (!name) return '';
								
								// Remove visual formatting symbols and indentation
								let cleaned = name
									.replace(/^[\s\t]*/, '') // Remove leading whitespace
									.replace(/^[├└]─\s*/, '') // Remove tree connectors
									.replace(/^[📦🔧]\s*/, '') // Remove icons
									.replace(/\s*\[\d+\s*components?\]$/, '') // Remove component count
									.replace(/\s*\(\d+\s*components?\)$/, '') // Remove component count (parentheses)
									.trim();
								
								return cleaned;
							};

							// Helper function to extract parent info from Parent_Item column
							const extractParentSerialNumber = (parentItemText) => {
								if (!parentItemText || parentItemText.toLowerCase() === 'none' || parentItemText.toLowerCase() === 'top level') {
									return null;
								}
								
								// Extract serial number from format: "Parent Name (SERIAL-123)"
								const match = parentItemText.match(/\(([^)]+)\)$/);
								return match ? match[1] : parentItemText;
							};

							// First pass: Create all equipment items without relationships
							const tempEquipmentMap = new Map();
							const serialToIdMap = new Map();

							data.forEach((item, index) => {
								try {
									const cleanedName = cleanEquipmentName(item[columnMap.name]);
									const serialNumber = item[columnMap.serialNumber];
									
									if (!cleanedName || !serialNumber) {
										errors.push(`Row ${index + 1}: Missing required fields (name or serial number)`);
										return;
									}

									const equipmentId = Date.now().toString() + index + Math.random().toString(36).substr(2, 5);
									
									const equipmentData = {
										id: equipmentId,
										name: cleanedName,
										type: item[columnMap.type] || 'General',
										serialNumber: serialNumber,
										condition: (columnMap.condition && item[columnMap.condition]) || "good",
										purchaseDate: (columnMap.purchaseDate && item[columnMap.purchaseDate]) || new Date().toISOString().split("T")[0],
										notes: (columnMap.notes && item[columnMap.notes]) || "",
										parentId: null, // Will be set in second pass
										children: [],
									};

									tempEquipmentMap.set(equipmentId, {
										equipment: equipmentData,
										parentInfo: item[columnMap.parentId] || null
									});
									
									serialToIdMap.set(serialNumber, equipmentId);
									importedCount++;

								} catch (err) {
									errors.push(`Row ${index + 1}: ${err.message}`);
								}
							});

							// Second pass: Establish parent-child relationships
							for (const [equipmentId, data] of tempEquipmentMap.entries()) {
								const { equipment, parentInfo } = data;
								
								if (parentInfo) {
									const parentSerialNumber = extractParentSerialNumber(parentInfo);
									
									if (parentSerialNumber) {
										const parentId = serialToIdMap.get(parentSerialNumber);
										
										if (parentId && tempEquipmentMap.has(parentId)) {
											// Set parent relationship
											equipment.parentId = parentId;
											
											// Add to parent's children array
											const parentEquipment = tempEquipmentMap.get(parentId).equipment;
											if (!parentEquipment.children.includes(equipmentId)) {
												parentEquipment.children.push(equipmentId);
											}
										} else {
											console.warn(`Parent not found for equipment ${equipment.name}: ${parentSerialNumber}`);
										}
									}
								}
								
								equipmentList.push(equipment);
								setProgress(Math.round((importedCount / tempEquipmentMap.size) * 100));
							}

							// Save the updated equipment list to localStorage
							localStorage.setItem("equipment", JSON.stringify(equipmentList));

							// Refresh data from localStorage to update the UI
							refreshData();

							setImporting(false);

							if (errors.length > 0) {
								setError(`Imported ${importedCount} out of ${data.length} items. Errors: ${errors.length}`);
							}

							if (onImportComplete) {
								onImportComplete(importedCount, errors);
							}
						},
						error: error => {
							setError(`Error parsing CSV: ${error}`);
							setImporting(false);
						},
					});
				} catch (err) {
					setError(`Error processing file: ${err.message}`);
					setImporting(false);
				}
			};

			reader.readAsText(file);
		} catch (err) {
			setError(`Error reading file: ${err.message}`);
			setImporting(false);
		}
	};

	return (
		<div className="mb-8">
			<h3 className="text-lg font-medium mb-4">Import Equipment from CSV</h3>

			<div className="mb-4">
				<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CSV File</label>
				<input
					type="file"
					accept=".csv"
					onChange={handleFileChange}
					className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 dark:file:bg-gray-700 dark:file:text-gray-200 hover:file:bg-gray-200 dark:hover:file:bg-gray-600"
				/>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					<strong>Basic Format:</strong> name, type, serialNumber (required). Optional: condition, purchaseDate, notes, parentId.
				</p>
				<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
					<strong>Enhanced Import:</strong> Also supports hierarchical exports with visual formatting, Equipment_Structure, Item_Name, Parent_Item columns.
				</p>
			</div>

			{preview && (
				<div className="mb-4 overflow-x-auto">
					<h4 className="text-md font-medium mb-2">Preview:</h4>
					<table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 border border-gray-200 dark:border-gray-700">
						<thead className="bg-gray-50 dark:bg-gray-800">
							<tr>
								{preview.meta.fields.map((field, i) => (
									<th
										key={i}
										className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
									>
										{field}
									</th>
								))}
							</tr>
						</thead>
						<tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
							{preview.data.map((row, i) => (
								<tr key={i}>
									{preview.meta.fields.map((field, j) => (
										<td key={j} className="px-4 py-2 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
											{row[field]}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
					{preview.data.length > 0 && (
						<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
							Showing {preview.data.length} of {file ? file.name : "unknown"} rows
						</p>
					)}
				</div>
			)}

			{error && (
				<div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded">{error}</div>
			)}

			{importing && (
				<div className="mb-4">
					<div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
						<div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
					</div>
					<p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Importing: {progress}% complete</p>
				</div>
			)}

			<button
				onClick={handleImport}
				disabled={!file || importing}
				className={`px-4 py-2 rounded-md text-white ${
					!file || importing ? "bg-gray-400 cursor-not-allowed" : "bg-primary hover:bg-primary-dark"
				}`}
			>
				{importing ? "Importing..." : "Import Equipment"}
			</button>
		</div>
	);
};

export default CSVImport;
