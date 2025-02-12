import React, { useState } from "react";

const AddAccount = (): JSX.Element => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [apiId, setApiId] = useState("");
  const [apiHash, setApiHash] = useState("");
  const [waitingForCode, setWaitingForCode] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");

  const startLogin = async () => {
    const response = await fetch("/start-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, apiId, apiHash }),
    });

    const data = await response.json();
    if (data.success) {
      setWaitingForCode(true); // Show the code input field
    } else {
      alert(data.error);
    }
  };

  const verifyCode = async () => {
    const response = await fetch("/verify-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber, phoneCode }),
    });

    const data = await response.json();
    if (data.success) {
      alert("Login successful!");
    } else {
      alert(data.error);
    }
  };

  return (
    <div>
      {!waitingForCode ? (
        <div>
          <h2>Login with Telegram</h2>
          <input
            type="text"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <input
            type="text"
            placeholder="API ID"
            value={apiId}
            onChange={(e) => setApiId(e.target.value)}
          />
          <input
            type="text"
            placeholder="API Hash"
            value={apiHash}
            onChange={(e) => setApiHash(e.target.value)}
          />
          <button onClick={startLogin}>Send Code</button>
        </div>
      ) : (
        <div>
          <h2>Enter Telegram Code</h2>
          <input
            type="text"
            placeholder="Enter the code"
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value)}
          />
          <button onClick={verifyCode}>Verify</button>
        </div>
      )}
    </div>
  );
};

export default AddAccount;
