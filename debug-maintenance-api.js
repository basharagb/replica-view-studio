// Debug script to test maintenance API
const testMaintenanceAPI = async () => {
  try {
    const response = await fetch('http://192.168.1.14:5000/readings/latest/by-silo-number?silo_number=16');
    const data = await response.json();
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ Data Structure:', JSON.stringify(data, null, 2));
    console.log('✅ Cable Count:', data[0].cable_count);
    console.log('✅ Has Cable 0 Data:', data[0].cable_0_level_0 !== undefined);
    console.log('✅ Has Cable 1 Data:', data[0].cable_1_level_0 !== undefined);
    console.log('✅ Sample Cable 0 Sensor:', {
      level: data[0].cable_0_level_0,
      color: data[0].cable_0_color_0
    });
    console.log('✅ Sample Cable 1 Sensor:', {
      level: data[0].cable_1_level_0,
      color: data[0].cable_1_color_0
    });
    
  } catch (error) {
    console.error('❌ API Error:', error);
  }
};

testMaintenanceAPI();
