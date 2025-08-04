import { LabInterface } from "../components/LabInterface";

const Index = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Testing App Load</h1>
      <p>If you can see this, the basic app is working.</p>
      <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
        <LabInterface />
      </div>
    </div>
  );
};

export default Index;
