import store from "../store";
import i18next from "i18next";
import TrackerServices from "./TrackerServices";
import dayjs from "../configs/dayjs";

/**
 * Service class for handling AI assistant functionality using the Gemini API
 */
class AIServices {
  /**
   * Get the API key from environment variables
   */
  static getAPIKey() {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }

  static async fetchGeminiResponse(text) {
    try {
      const apiKey = this.getAPIKey();
      if (!apiKey) {
        throw new Error("Gemini API key not found");
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.candidates || data.candidates.length === 0) {
        throw new Error(data.error?.message || i18next.t("aiError"));
      }

      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error("Error fetching Gemini response:", error);
      throw error;
    }
  }

  /**
   * Send a message to the Gemini API
   * @param {string} message - The user's message
   * @returns {Promise<string>} - The AI's response
   */
  static async sendMessage(userMessage) {
    try {
      const { user: { email, fullName, gender } } = store.getState().user;
      const message = `
        You are a helpful Vietnamese expense tracking assistant. This is user info: ${JSON.stringify({ email, fullName, gender })}
        Respond to this message in Vietnamese unless the user types in English:
        
        ${userMessage}
        
        If the message mentions an expense or income, try to identify the following information:
        - Transaction type (expense or income)
        - Amount (e.g., "30k", "30.000", "ba mươi nghìn")
        - Category (e.g., "ăn sáng", "cafe", "mua sắm", "xem phim")
        - Include this information in your response in a natural way
        - If the message is about financial tracking but doesn't include specific transaction details, ask for more information
        - If the message is a greeting or general question, respond naturally without asking for transaction details
        - Your responses should be helpful, conversational, and concise (1-3 sentences maximum)

        If the user asks for information, respond user info like email, full name, and gender.
      `;
      const response = await this.fetchGeminiResponse(message);
      return response;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      throw error;
    }
  }

  /**
   * Analyze the message for transaction information
   * @param {string} userMessage - The user message
   * @param {string} aiResponse - The AI response
   * @returns {Promise<Object|null>} - The extracted transaction data or null if no transaction was detected
   */
  static async analyzeMessageForTransaction(userMessage, aiResponse) {
    try {
      // Get all trackers
      const trackers = await TrackerServices.getTrackers();
      if (!trackers || trackers.length === 0) {
        console.error("No trackers found");
        return null;
      }

      const mergedTrackers = [];
      trackers.forEach((tracker) => {
        if (tracker.groups && tracker.groups.length > 0) {
          tracker.groups.forEach((group) => {
            mergedTrackers.push({
              trackerId: group.uid,
              trackerName: group.groupName,
              owner: group.owner,
            });
          });
        }
      });

      if (mergedTrackers.length === 0) {
        console.error("No trackers found");
        return null;
      }

      const categories = await Promise.all(
        mergedTrackers.map(async (tracker) => {
          const trackerId = tracker.trackerId;
          const categories = await TrackerServices.getCategories(trackerId);
          if (!categories || categories.length === 0) {
            return [
              {
                categoryName: i18next.t("noCategory"),
                categoryId: "uncategorized",
                trackerId,
                trackerName: tracker.trackerName,
                owner: tracker.owner,
              },
            ];
          }
          return categories.map((category) => ({
            categoryName: category.name,
            categoryId: category.uid,
            trackerId,
            trackerName: tracker.trackerName,
            owner: tracker.owner,
          }));
        })
      );

      const flattenedTrackers = categories.flat();
      if (!flattenedTrackers || flattenedTrackers.length === 0) {
        console.error("No trackers found");
        return null;
      }

      // Find the best match for the category based on the AI response
      const { user: { uid } } = store.getState().user;
      const message = `
        You are a helpful Vietnamese expense tracking assistant.
        Find the best match for the tracker name, prioritize tracker that owner is ${uid}, after find the best match tracker, find the best match category based on the following text:
        ${aiResponse}
        Here are the trackers and categories:
        ${JSON.stringify(flattenedTrackers)}
        Only respond with the best match in JSON format, including the following fields:
        - trackerId (if not found, respond with first trackerId)
        - trackerName (if not found, respond with first trackerName and explain it is the first tracker because no match was found)
        - categoryId (if not found in any tracker, respond with "uncategorized")
        - categoryName
        - amount (respond with the amount in positive number like 30000, 50000, 100000, 500000, etc..., if not found, respond with "unknown")
        - type (respond with "income" or "expense" based on the transaction type)
        - description (respond with the description of the transaction minimum 10 characters explaining the transaction)
        - name (respond with the name of the transaction with max length 55 characters)
      `;
      const bestMatchResponse = await this.fetchGeminiResponse(message);
      const bestMatch = bestMatchResponse ? JSON.parse(bestMatchResponse.replace("```json", "").replace("```", "")) : {};
      if (!bestMatch || Object.keys(bestMatch).length === 0) {
        console.error("No best match found");
        return null;
      }
      if (!bestMatch.amount || bestMatch.amount === "unknown" || isNaN(parseFloat(bestMatch.amount))) {
        console.error("No amount found");
        return null;
      }

      // Return the transaction with the best match information
      return {
        type: bestMatch.type,
        amount: parseFloat(bestMatch.amount),
        categoryName: bestMatch.categoryName,
        category: bestMatch.categoryId,
        trackerId: bestMatch.trackerId,
        trackerName: bestMatch.trackerName,
        name: bestMatch.name,
        time: dayjs(),
        description: bestMatch.description || userMessage,
      };
    } catch (error) {
      console.error("Error analyzing message for transaction:", error);
      return null;
    }
  }

  /**
   * Create a transaction from extracted data
   * @param {Object} transactionData - The transaction data
   * @returns {Promise<string>} - The ID of the created transaction
   */
  static async createTransaction(transactionData) {
    try {
      // Create transaction data object
      const { trackerId, type, amount, name, time, description, category } = transactionData;
      const finalTransactionData = {
        type,
        amount: amount,
        name,
        time,
        description,
        category,
      };

      // Create the transaction
      return await TrackerServices.createTransaction(trackerId, finalTransactionData);
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  }
}

export default AIServices;
