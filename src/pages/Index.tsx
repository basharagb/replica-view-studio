import { LabInterface } from "../components/LabInterface";

const LiveTest = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Live Readings</h1>
      <p>Real-time silo monitoring and readings interface.</p>
      
      <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
        <LabInterface />
      </div>
    </div>
  );
};

export default LiveTest;
