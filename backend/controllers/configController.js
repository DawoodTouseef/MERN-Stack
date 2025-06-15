import fs from "fs";
import path from "path";

// Path to the JSON file where configuration is stored
const configFilePath = path.resolve(__dirname, "../config/config.json");

// Helper function to read the configuration file
const readConfigFile = () => {
  try {
    const data = fs.readFileSync(configFilePath, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading configuration file:", error.message);
    return {};
  }
};

// Helper function to write to the configuration file
const writeConfigFile = (config) => {
  try {
    fs.writeFileSync(configFilePath, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing to configuration file:", error.message);
  }
};

// Get configuration settings
export const getConfig = async (req, res) => {
  try {
    const config = readConfigFile();
    res.status(200).json(config);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update configuration settings
export const updateConfig = async (req, res) => {
  try {
    const { paymentApiKey, exchangeRateApiKey, taxJarApiKey } = req.body;

    // Read the current configuration
    const currentConfig = readConfigFile();

    // Update the configuration
    const updatedConfig = {
      ...currentConfig,
      paymentApiKey: paymentApiKey || currentConfig.paymentApiKey,
      exchangeRateApiKey: exchangeRateApiKey || currentConfig.exchangeRateApiKey,
      taxJarApiKey: taxJarApiKey || currentConfig.taxJarApiKey,
    };

    // Write the updated configuration to the file
    writeConfigFile(updatedConfig);

    res.status(200).json({ message: "Configuration updated successfully", updatedConfig });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};