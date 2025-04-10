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

							// Check for required columns
							const requiredColumns = ["name", "type", "serialNumber"];
							const headers = Object.keys(data[0] || {});

							const missingColumns = requiredColumns.filter(
								col => !headers.map(h => h.toLowerCase()).includes(col.toLowerCase())
							);

							if (missingColumns.length > 0) {
								setError(`Missing required columns: ${missingColumns.join(", ")}`);
								setImporting(false);
								return;
							}

							// SIMPLIFIED APPROACH: Store all equipment in localStorage directly
							let importedCount = 0;
							const errors = [];

							// Get existing equipment from localStorage
							const storedEquipment = localStorage.getItem("equipment");
							let equipmentList = storedEquipment ? JSON.parse(storedEquipment) : [];

							// Process each item in the CSV
							data.forEach((item, index) => {
								try {
									// Map CSV columns to equipment object
									const columnMap = {};
									headers.forEach(header => {
										const lowerHeader = header.toLowerCase();
										if (lowerHeader === "name") columnMap.name = header;
										if (lowerHeader === "type") columnMap.type = header;
										if (lowerHeader === "serialnumber") columnMap.serialNumber = header;
										if (lowerHeader === "condition") columnMap.condition = header;
										if (lowerHeader === "purchasedate") columnMap.purchaseDate = header;
										if (lowerHeader === "notes") columnMap.notes = header;
									});

									// Create equipment object with mapped values
									const equipmentData = {
										id: Date.now().toString() + index + Math.random().toString(36).substr(2, 5),
										name: item[columnMap.name],
										type: item[columnMap.type],
										serialNumber: item[columnMap.serialNumber],
										condition: columnMap.condition ? item[columnMap.condition] || "good" : "good",
										purchaseDate: columnMap.purchaseDate
											? item[columnMap.purchaseDate]
											: new Date().toISOString().split("T")[0],
										notes: columnMap.notes ? item[columnMap.notes] : "",
									};

									// Validate required fields
									if (!equipmentData.name || !equipmentData.type || !equipmentData.serialNumber) {
										errors.push(`Row ${index + 1}: Missing required fields`);
										return;
									}

									// Add to our equipment list
									equipmentList.push(equipmentData);
									importedCount++;

									// Update progress
									setProgress(Math.round(((index + 1) / data.length) * 100));
								} catch (err) {
									errors.push(`Row ${index + 1}: ${err.message}`);
								}
							});

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
					The CSV file must include columns for name, type, and serialNumber (required). Optional columns: condition,
					purchaseDate, notes.
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
