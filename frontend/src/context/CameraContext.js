// src/context/CameraContext.js
import React, { createContext, useContext, useState } from "react";

const CameraContext = createContext();

export const useCamera = () => {
	const context = useContext(CameraContext);
	if (!context) {
		throw new Error("useCamera must be used within a CameraProvider");
	}
	return context;
};

export const CameraProvider = ({ children }) => {
	const [isCameraActive, setIsCameraActive] = useState(false);

	return <CameraContext.Provider value={{ isCameraActive, setIsCameraActive }}>{children}</CameraContext.Provider>;
};
