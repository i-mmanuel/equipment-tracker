import Papa from 'papaparse';

export class EnhancedCSVExporter {
  constructor(equipmentData, bookingsData = []) {
    this.equipmentData = equipmentData;
    this.bookingsData = bookingsData;
  }

  // Export master inventory with enhanced structure including hierarchy
  exportMasterInventory() {
    const headers = [
      'Equipment_ID',
      'Category',
      'Item_Name',
      'Type',
      'Serial_Number',
      'Purchase_Date',
      'Status',
      'Condition',
      'Location',
      'Parent_Item',
      'Child_Count',
      'Hierarchy_Level',
      'Last_Updated',
      'Notes'
    ];

    // Create hierarchically ordered data
    const hierarchicalData = this.getHierarchicalOrderedData();
    
    const formattedData = hierarchicalData.map((item, index) => {
      const parentItem = item.parentId 
        ? this.equipmentData.find(eq => eq.id === item.parentId)
        : null;
      
      const childCount = item.children ? item.children.length : 0;
      const hierarchyLevel = this.getHierarchyLevel(item);
      
      // Add visual indentation to item name based on hierarchy level
      const indentPrefix = '  '.repeat(hierarchyLevel); // Two spaces per level
      let displayName;
      
      if (hierarchyLevel === 0) {
        const childCount = item.children ? item.children.length : 0;
        displayName = childCount > 0 ? `${item.name} [${childCount} components]` : item.name;
      } else {
        displayName = `${indentPrefix}└─ ${item.name}`;
      }

      return {
        Equipment_ID: `EQ${String(index + 1).padStart(3, '0')}`,
        Category: this.categorizeItem(item.name, item.type),
        Item_Name: displayName,
        Type: item.type || 'General',
        Serial_Number: item.serialNumber || '',
        Purchase_Date: item.purchaseDate || '',
        Status: this.getAvailabilityStatus(item.id),
        Condition: this.formatCondition(item.condition),
        Location: item.location || 'Storage',
        Parent_Item: parentItem ? `${parentItem.name} (${parentItem.serialNumber})` : 'None',
        Child_Count: childCount,
        Hierarchy_Level: hierarchyLevel,
        Last_Updated: new Date().toISOString().split('T')[0],
        Notes: item.notes || ''
      };
    });

    return Papa.unparse({ fields: headers, data: formattedData });
  }

  // Export equipment usage summary
  exportUsageSummary() {
    const headers = [
      'Equipment_ID',
      'Item_Name',
      'Parent_Equipment',
      'Total_Bookings',
      'Active_Bookings',
      'Last_Used',
      'Utilization_Rate',
      'Current_Status',
      'Next_Available'
    ];

    // Use hierarchical ordering for usage summary too
    const hierarchicalData = this.getHierarchicalOrderedData();

    const formattedData = hierarchicalData.map((item, index) => {
      const itemBookings = this.bookingsData.filter(booking => 
        booking.equipmentIds && booking.equipmentIds.includes(item.id)
      );
      
      const activeBookings = itemBookings.filter(booking => 
        booking.status === 'confirmed' || booking.status === 'in-use'
      );

      const lastUsed = itemBookings.length > 0 
        ? new Date(Math.max(...itemBookings.map(b => new Date(b.date || b.startDate)))).toISOString().split('T')[0]
        : 'Never';

      const parentItem = item.parentId 
        ? this.equipmentData.find(eq => eq.id === item.parentId)
        : null;

      const hierarchyLevel = this.getHierarchyLevel(item);
      const indentPrefix = '  '.repeat(hierarchyLevel);
      const displayName = hierarchyLevel > 0 
        ? `${indentPrefix}└─ ${item.name}` 
        : item.name;

      return {
        Equipment_ID: `EQ${String(index + 1).padStart(3, '0')}`,
        Item_Name: displayName,
        Parent_Equipment: parentItem ? parentItem.name : 'None',
        Total_Bookings: itemBookings.length,
        Active_Bookings: activeBookings.length,
        Last_Used: lastUsed,
        Utilization_Rate: this.calculateUtilizationRate(itemBookings),
        Current_Status: this.getAvailabilityStatus(item.id),
        Next_Available: this.getNextAvailableDate(item.id)
      };
    });

    return Papa.unparse({ fields: headers, data: formattedData });
  }

  // Export bookings log
  exportBookingsLog() {
    const headers = [
      'Booking_ID',
      'Equipment_Items',
      'Requester',
      'Event_Name',
      'Start_Date',
      'End_Date',
      'Status',
      'Priority',
      'Notes',
      'Created_Date',
      'Last_Modified'
    ];

    const formattedData = this.bookingsData.map((booking, index) => {
      const equipmentNames = booking.equipmentIds 
        ? booking.equipmentIds.map(id => {
            const equipment = this.equipmentData.find(eq => eq.id === id);
            return equipment ? equipment.name : `Unknown (${id})`;
          }).join('; ')
        : 'None specified';

      return {
        Booking_ID: `BK${String(index + 1).padStart(3, '0')}`,
        Equipment_Items: equipmentNames,
        Requester: booking.requester || booking.user || '',
        Event_Name: booking.eventName || booking.title || '',
        Start_Date: booking.startDate || booking.date || '',
        End_Date: booking.endDate || booking.date || '',
        Status: this.formatBookingStatus(booking.status),
        Priority: this.calculateBookingPriority(booking),
        Notes: booking.notes || booking.description || '',
        Created_Date: booking.createdAt || new Date().toISOString().split('T')[0],
        Last_Modified: booking.updatedAt || new Date().toISOString().split('T')[0]
      };
    });

    return Papa.unparse({ fields: headers, data: formattedData });
  }

  // Export condition report
  exportConditionReport() {
    const headers = [
      'Equipment_ID',
      'Item_Name',
      'Category',
      'Current_Condition',
      'Purchase_Date',
      'Age_In_Days',
      'Usage_Frequency',
      'Maintenance_Priority',
      'Recommended_Action',
      'Estimated_Replacement_Date'
    ];

    const formattedData = this.equipmentData.map((item, index) => {
      const ageInDays = item.purchaseDate 
        ? Math.floor((new Date() - new Date(item.purchaseDate)) / (1000 * 60 * 60 * 24))
        : 0;

      const itemBookings = this.bookingsData.filter(booking => 
        booking.equipmentIds && booking.equipmentIds.includes(item.id)
      );

      return {
        Equipment_ID: `EQ${String(index + 1).padStart(3, '0')}`,
        Item_Name: item.name,
        Category: this.categorizeItem(item.name, item.type),
        Current_Condition: this.formatCondition(item.condition),
        Purchase_Date: item.purchaseDate || '',
        Age_In_Days: ageInDays,
        Usage_Frequency: this.calculateUsageFrequency(itemBookings),
        Maintenance_Priority: this.calculateMaintenancePriority(item, itemBookings),
        Recommended_Action: this.getRecommendedAction(item, ageInDays, itemBookings),
        Estimated_Replacement_Date: this.estimateReplacementDate(item.purchaseDate, item.condition)
      };
    });

    return Papa.unparse({ fields: headers, data: formattedData });
  }

  // Export hierarchical structure with visual nesting
  exportHierarchicalStructure() {
    const headers = [
      'Equipment_Structure',
      'Type',
      'Serial_Number',
      'Condition',
      'Purchase_Date',
      'Hierarchy_Level',
      'Parent',
      'Notes'
    ];

    const hierarchicalData = this.getHierarchicalOrderedData();
    
    const formattedData = hierarchicalData.map(item => {
      const hierarchyLevel = this.getHierarchyLevel(item);
      const parentItem = item.parentId 
        ? this.equipmentData.find(eq => eq.id === item.parentId)
        : null;
      
      // Create visual tree structure
      let displayName;
      if (hierarchyLevel === 0) {
        // Parent items
        const childCount = item.children ? item.children.length : 0;
        displayName = childCount > 0 
          ? `📦 ${item.name} (${childCount} components)`
          : `📦 ${item.name}`;
      } else {
        // Child items with tree structure
        const indent = '  '.repeat(hierarchyLevel - 1);
        const connector = '├─ ';
        displayName = `${indent}${connector}🔧 ${item.name}`;
      }

      return {
        Equipment_Structure: displayName,
        Type: item.type || '',
        Serial_Number: item.serialNumber || '',
        Condition: this.formatCondition(item.condition),
        Purchase_Date: item.purchaseDate || '',
        Hierarchy_Level: hierarchyLevel,
        Parent: parentItem ? parentItem.name : 'Top Level',
        Notes: item.notes || ''
      };
    });

    return Papa.unparse({ fields: headers, data: formattedData });
  }

  // Export summary dashboard data
  exportSummaryDashboard() {
    const headers = [
      'Metric',
      'Value',
      'Description',
      'Export_Date'
    ];

    const totalEquipment = this.equipmentData.length;
    const availableItems = this.equipmentData.filter(item => 
      this.getAvailabilityStatus(item.id) === 'AVAILABLE'
    ).length;
    const inUseItems = this.equipmentData.filter(item => 
      this.getAvailabilityStatus(item.id) === 'IN_USE'
    ).length;
    const needsRepair = this.equipmentData.filter(item => 
      item.condition === 'needs-repair'
    ).length;
    const excellentCondition = this.equipmentData.filter(item => 
      item.condition === 'excellent'
    ).length;

    const categories = [...new Set(this.equipmentData.map(item => 
      this.categorizeItem(item.name, item.type)
    ))].length;

    const totalBookings = this.bookingsData.length;
    const activeBookings = this.bookingsData.filter(booking => 
      booking.status === 'confirmed' || booking.status === 'in-use'
    ).length;

    const utilizationRate = totalEquipment > 0 
      ? ((inUseItems / totalEquipment) * 100).toFixed(1)
      : '0.0';

    const data = [
      {
        Metric: 'Total Equipment',
        Value: totalEquipment,
        Description: 'Total number of equipment items in inventory',
        Export_Date: new Date().toISOString().split('T')[0]
      },
      {
        Metric: 'Available Items',
        Value: availableItems,
        Description: 'Equipment items currently available for use',
        Export_Date: new Date().toISOString().split('T')[0]
      },
      {
        Metric: 'Items In Use',
        Value: inUseItems,
        Description: 'Equipment items currently being used',
        Export_Date: new Date().toISOString().split('T')[0]
      },
      {
        Metric: 'Items Needing Repair',
        Value: needsRepair,
        Description: 'Equipment items that require maintenance or repair',
        Export_Date: new Date().toISOString().split('T')[0]
      },
      {
        Metric: 'Items in Excellent Condition',
        Value: excellentCondition,
        Description: 'Equipment items in excellent working condition',
        Export_Date: new Date().toISOString().split('T')[0]
      },
      {
        Metric: 'Equipment Categories',
        Value: categories,
        Description: 'Number of different equipment categories',
        Export_Date: new Date().toISOString().split('T')[0]
      },
      {
        Metric: 'Total Bookings',
        Value: totalBookings,
        Description: 'Total number of equipment bookings made',
        Export_Date: new Date().toISOString().split('T')[0]
      },
      {
        Metric: 'Active Bookings',
        Value: activeBookings,
        Description: 'Currently active or confirmed bookings',
        Export_Date: new Date().toISOString().split('T')[0]
      },
      {
        Metric: 'Utilization Rate (%)',
        Value: utilizationRate,
        Description: 'Percentage of equipment currently in use',
        Export_Date: new Date().toISOString().split('T')[0]
      }
    ];

    return Papa.unparse({ fields: headers, data });
  }

  // Utility methods
  categorizeItem(itemName, itemType) {
    const name = itemName.toLowerCase();
    const type = (itemType || '').toLowerCase();
    
    const categories = {
      'AIRPORT_STARS': ['first timer', 'new convert', 'welcome', 'placard', 'airport'],
      'USHERS': ['usher', 'offering', 'suitcase', 'collection'],
      'TECH': ['keyboard', 'mic', 'microphone', 'sound', 'cable', 'stand', 'audio', 'video'],
      'LOVELETTES': ['lovelette', 'dance', 'performance'],
      'CATERING': ['cooler', 'drink', 'food', 'biscuit', 'refreshment'],
      'GENERAL': ['box', 'bag', 'storage', 'tape', 'scissors']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => name.includes(keyword) || type.includes(keyword))) {
        return category;
      }
    }
    return 'GENERAL';
  }

  formatCondition(condition) {
    const conditionMap = {
      'excellent': 'Excellent',
      'good': 'Good', 
      'fair': 'Fair',
      'poor': 'Poor',
      'needs-repair': 'Needs Repair'
    };
    return conditionMap[condition] || condition || 'Unknown';
  }

  formatBookingStatus(status) {
    const statusMap = {
      'requested': 'Requested',
      'confirmed': 'Confirmed',
      'in-use': 'In Use',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status || 'Unknown';
  }

  getAvailabilityStatus(equipmentId) {
    const activeBookings = this.bookingsData.filter(booking => 
      booking.equipmentIds && 
      booking.equipmentIds.includes(equipmentId) && 
      (booking.status === 'confirmed' || booking.status === 'in-use')
    );
    return activeBookings.length > 0 ? 'IN_USE' : 'AVAILABLE';
  }

  calculateUtilizationRate(itemBookings) {
    if (itemBookings.length === 0) return '0%';
    
    const completedBookings = itemBookings.filter(booking => 
      booking.status === 'completed' || booking.status === 'in-use'
    );
    
    const rate = itemBookings.length > 0 
      ? ((completedBookings.length / itemBookings.length) * 100).toFixed(1)
      : '0.0';
      
    return `${rate}%`;
  }

  calculateUsageFrequency(itemBookings) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentBookings = itemBookings.filter(booking => {
      const bookingDate = new Date(booking.date || booking.startDate);
      return bookingDate >= thirtyDaysAgo;
    });
    
    if (recentBookings.length === 0) return 'Low';
    if (recentBookings.length <= 2) return 'Medium';
    return 'High';
  }

  calculateMaintenancePriority(item, itemBookings) {
    if (item.condition === 'needs-repair') return 'HIGH';
    if (item.condition === 'poor') return 'MEDIUM';
    
    const usageFreq = this.calculateUsageFrequency(itemBookings);
    if (usageFreq === 'High' && item.condition === 'fair') return 'MEDIUM';
    
    return 'LOW';
  }

  calculateBookingPriority(booking) {
    if (booking.priority) return booking.priority.toUpperCase();
    
    const eventName = (booking.eventName || booking.title || '').toLowerCase();
    if (eventName.includes('sunday') || eventName.includes('service')) return 'HIGH';
    if (eventName.includes('prayer') || eventName.includes('meeting')) return 'MEDIUM';
    
    return 'NORMAL';
  }

  getRecommendedAction(item, ageInDays, itemBookings) {
    if (item.condition === 'needs-repair') return 'Immediate repair required';
    if (item.condition === 'poor') return 'Schedule maintenance';
    
    const usageFreq = this.calculateUsageFrequency(itemBookings);
    if (ageInDays > 1095 && usageFreq === 'High') return 'Consider replacement';
    if (ageInDays > 730 && item.condition === 'fair') return 'Monitor condition closely';
    
    return 'Continue regular maintenance';
  }

  estimateReplacementDate(purchaseDate, condition) {
    if (!purchaseDate) return 'Unknown';
    
    const purchase = new Date(purchaseDate);
    let yearsToAdd = 5; // Default lifespan
    
    if (condition === 'excellent') yearsToAdd = 7;
    else if (condition === 'good') yearsToAdd = 5;
    else if (condition === 'fair') yearsToAdd = 3;
    else if (condition === 'poor') yearsToAdd = 1;
    else if (condition === 'needs-repair') yearsToAdd = 0;
    
    const replacementDate = new Date(purchase);
    replacementDate.setFullYear(replacementDate.getFullYear() + yearsToAdd);
    
    return replacementDate.toISOString().split('T')[0];
  }

  getNextAvailableDate(equipmentId) {
    const futureBookings = this.bookingsData
      .filter(booking => 
        booking.equipmentIds && 
        booking.equipmentIds.includes(equipmentId) && 
        (booking.status === 'confirmed' || booking.status === 'in-use') &&
        new Date(booking.endDate || booking.date) > new Date()
      )
      .sort((a, b) => new Date(a.endDate || a.date) - new Date(b.endDate || b.date));
    
    if (futureBookings.length === 0) return 'Available now';
    
    const lastBooking = futureBookings[futureBookings.length - 1];
    const nextAvailable = new Date(lastBooking.endDate || lastBooking.date);
    nextAvailable.setDate(nextAvailable.getDate() + 1);
    
    return nextAvailable.toISOString().split('T')[0];
  }

  getHierarchyLevel(item) {
    let level = 0;
    let currentItem = item;
    
    // Traverse up the hierarchy to count levels
    while (currentItem.parentId) {
      level++;
      currentItem = this.equipmentData.find(eq => eq.id === currentItem.parentId);
      
      // Prevent infinite loops in case of data corruption
      if (!currentItem || level > 10) break;
    }
    
    return level;
  }

  // Get equipment data ordered hierarchically (parents followed by their children)
  getHierarchicalOrderedData() {
    const orderedData = [];
    const processed = new Set();

    // Helper function to add item and its children recursively
    const addItemAndChildren = (item) => {
      if (processed.has(item.id)) return;
      
      orderedData.push(item);
      processed.add(item.id);
      
      // Add children if they exist
      if (item.children && item.children.length > 0) {
        // Sort children by name for consistent ordering
        const childrenItems = item.children
          .map(childId => this.equipmentData.find(eq => eq.id === childId))
          .filter(child => child) // Remove any null/undefined
          .sort((a, b) => a.name.localeCompare(b.name));
        
        childrenItems.forEach(child => {
          addItemAndChildren(child);
        });
      }
    };

    // Start with parent items (no parentId), sorted by name
    const parentItems = this.equipmentData
      .filter(item => !item.parentId)
      .sort((a, b) => a.name.localeCompare(b.name));

    parentItems.forEach(parent => {
      addItemAndChildren(parent);
    });

    // Add any remaining items that weren't processed (orphaned items)
    this.equipmentData.forEach(item => {
      if (!processed.has(item.id)) {
        orderedData.push(item);
      }
    });

    return orderedData;
  }
}

// Export utility functions
export const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

export const getFormattedDate = () => {
  return new Date().toISOString().split('T')[0];
};
