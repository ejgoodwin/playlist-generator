import { useState } from "react";

const TestComponent = () => {
  const [testString, setTestString] = useState("start");

  const fetchData = async () => {
    const response = await fetch("http://localhost:3010/test");
    const data = await response.json();
    setTestString(data);
  };

  return (
    <>
      <button onClick={fetchData}>click</button>
      <p>{testString}</p>
    </>
  );
};

export default TestComponent;
