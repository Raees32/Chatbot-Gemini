import React, { useState, useEffect } from "react";
import * as GoogleGenerativeAI from "@google/generative-ai";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import * as Speech from "expo-speech";

import { FontAwesome, Entypo } from "@expo/vector-icons";
import FlashMessage, { showMessage } from "react-native-flash-message";

const GeminiChat = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStopIcon, setShowStopIcon] = useState(false);

  const API_KEY = "";

  useEffect(() => {
    const startChat = async () => {
      try {
        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = "Hello!";
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        setMessages([{ text, user: false }]);
        showMessage({
          message: "Welcome to Desktop Embed Chat",
          description: text,
          type: "info",
          icon: "info",
          duration: 2000,
        });
      } catch (error) {
        console.error("Error starting chat:", error);
        showMessage({
          message: "Error starting chat",
          description: error.message,
          type: "danger",
          duration: 3000,
        });
      }
    };
    startChat();
  }, []);

  const sendMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = { text: userInput, user: true };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput("");
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await model.generateContent(userMessage.text);
      const response = result.response;
      const text = response.text();
      setMessages((prev) => [...prev, { text, user: false }]);
      setLoading(false);

      if (!isSpeaking) {
        Speech.speak(text);
        setIsSpeaking(true);
        setShowStopIcon(true);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      showMessage({
        message: "Error sending message",
        description: error.message,
        type: "danger",
        duration: 3000,
      });
      setLoading(false);
    }
  };

  const toggleSpeech = () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      Speech.speak(messages[messages.length - 1]?.text);
      setIsSpeaking(true);
    }
  };

  const clearChat = () => {
    setMessages([]);
    Speech.stop();
    setIsSpeaking(false);
    setShowStopIcon(false);
  };

  const renderMessage = ({ item }) => {
    
    const parts = item.text.split("** * **");
  
   
    let messageComponents = [];
  
    for (let i = 1; i < parts.length; i++) {
      const heading = parts[i].trim(); 
      const description = parts[i + 1] ? parts[i + 1].trim() : ""; 
      
      // Only add if heading exists
      if (heading) {
        messageComponents.push(
          <View key={i} style={styles.messageContent}>
            <View style={styles.headingContainer}>
              <Text style={styles.headingText}>{heading}</Text>
            </View>
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationText}>{description}</Text>
            </View>
          </View>
        );
      }
      
  
      i++;
    }
  
    return (
      <View
        style={[
          styles.messageContainer,
          item.user ? styles.userMessage : styles.aiMessage,
        ]}
      >
        {messageComponents.length > 0 ? messageComponents : (
          <Text style={item.user ? styles.userMessageText : styles.messageText}>
            {item.text}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How can I assist you today?</Text>
      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.messageList}
      />
      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={toggleSpeech} style={styles.iconButton}>
          <FontAwesome
            name={isSpeaking ? "microphone-slash" : "microphone"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type a message..."
          placeholderTextColor="#aaa"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <FontAwesome name="send" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={clearChat} style={styles.iconButton}>
          <Entypo name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#000",
  },
  messageList: {
    paddingVertical: 10,
  },
  messageContainer: {
    padding: 13,
    borderRadius: 10,
    marginBottom: 10,
   
  },
  userMessage: {
    backgroundColor: "#f0f0f0",
    alignSelf: "flex-end",
  },
  userMessageText: {
    fontSize: 17,
    color: "#000",
  },
  aiMessage: {
    backgroundColor: "#4a90e2",
  },
  messageText: {
    fontSize: 17,
    color: "#fff",
  },
  headingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
    textAlign: "left",
    marginBottom: 5,
  },
  explanationText: {
    textAlign: "left",
    color: "#000",
    fontSize: 16,
  },
  messageContent: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headingContainer: {
    flex: 1,
    borderRightWidth: 1,
   
    paddingRight: 10,
  },
  explanationContainer: {
    flex: 2,
    paddingLeft: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 10,
    color: "#333",
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#007AFF",
    marginLeft: 5,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "green",
    marginLeft: 5,
  },
});

export default GeminiChat;







//  For Chat Gpt Model Use Paid Scret Key 



// import React, { useState, useEffect } from "react";
// import OpenAI from "openai";
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   StyleSheet,
//   TouchableOpacity,
// } from "react-native";
// import * as Speech from "expo-speech";
// import { FontAwesome, Entypo } from "@expo/vector-icons";
// import FlashMessage, { showMessage } from "react-native-flash-message";


// const API_KEY = "eqsiW_kV_vkAZ7wRoRnDoTmVo_V7yrq4iAdsoapfjchxnTGZEfbH5I4dSzMLfQnt3dY_3feHU81gaANTa_uhJMUsA"; // Replace with your actual OpenAI API key
// const openai = new OpenAI({ apiKey: API_KEY });

// const GeminiChat = () => {
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [showStopIcon, setShowStopIcon] = useState(false);

//   useEffect(() => {
//     const startChat = async () => {
//       try {
//         const completion = await openai.chat.completions.create({
//           model: "gpt-4o-mini",
//           messages: [{ role: "system", content: "You are a helpful assistant." }],
//         });
//         const text = completion.choices[0].message.content;
//         setMessages([{ text, user: false }]);
//         showMessage({
//           message: "Welcome to Desktop Embed Chat",
//           description: text,
//           type: "info",
//           icon: "info",
//           duration: 2000,
//         });
//       } catch (error) {
//         console.error("Error starting chat:", error);
//         showMessage({
//           message: "Error starting chat",
//           description: error.message,
//           type: "danger",
//           duration: 3000,
//         });
//       }
//     };
//     startChat();
//   }, []);

//   const sendMessage = async (retries = 3) => {
//     if (!userInput.trim()) return;
  
//     const userMessage = { text: userInput, user: true };
//     setMessages((prev) => [...prev, userMessage]);
//     setUserInput("");
//     setLoading(true);
  
//     try {
//       const response = await openai.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages: [{ role: "user", content: userMessage.text }],
//         stream: true, // Enable streaming
//       });
  
//       // Listen for streamed responses
//       const reader = response.getReader();
//       const decoder = new TextDecoder();
//       let result = '';
  
//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break; // End of stream
//         result += decoder.decode(value); // Append the streamed chunk to the result
//         setMessages((prev) => [...prev, { text: result, user: false }]); // Update messages
//       }
//     } catch (error) {
//       if (error.status === 429 && retries > 0) {
//         console.warn("Rate limit reached, retrying...");
//         setTimeout(() => sendMessage(retries - 1), 2000); // Retry after 2 seconds
//       } else {
//         console.error("Error sending message:", error);
//         showMessage({
//           message: "Error sending message",
//           description: error.message,
//           type: "danger",
//           duration: 3000,
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleSpeech = () => {
//     if (isSpeaking) {
//       Speech.stop();
//       setIsSpeaking(false);
//     } else {
//       Speech.speak(messages[messages.length - 1]?.text);
//       setIsSpeaking(true);
//     }
//   };

//   const clearChat = () => {
//     setMessages([]);
//     Speech.stop();
//     setIsSpeaking(false);
//     setShowStopIcon(false);
//   };

//   const renderMessage = ({ item }) => (
//     <View
//       style={[
//         styles.messageContainer,
//         item.user ? styles.userMessage : styles.aiMessage,
//       ]}
//     >
//       <Text style={item.user ? styles.userMessageText : styles.messageText}>
//         {item.text}
//       </Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>How can I assist you today?</Text>
//       <FlatList
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={(item, index) => index.toString()}
//         contentContainerStyle={styles.messageList}
//       />
//       <View style={styles.inputContainer}>
//         <TouchableOpacity onPress={toggleSpeech} style={styles.iconButton}>
//           <FontAwesome
//             name={isSpeaking ? "microphone-slash" : "microphone"}
//             size={20}
//             color="#fff"
//           />
//         </TouchableOpacity>
//         <TextInput
//           style={styles.input}
//           value={userInput}
//           onChangeText={setUserInput}
//           placeholder="Type a message..."
//           placeholderTextColor="#aaa"
//           onSubmitEditing={sendMessage}
//         />
//         <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
//           <FontAwesome name="send" size={20} color="#fff" />
//         </TouchableOpacity>
//         <TouchableOpacity onPress={clearChat} style={styles.iconButton}>
//           <Entypo name="trash" size={20} color="#fff" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#fff",
//     paddingTop: 50,
//     paddingHorizontal: 10,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: 20,
//     color: "#000",
//   },
//   messageList: {
//     paddingVertical: 10,
//   },
//   messageContainer: {
//     padding: 13,
//     borderRadius: 10,
//     marginBottom: 10,
//   },
//   userMessage: {
//     backgroundColor: "#f0f0f0",
//     alignSelf: "flex-end",
//   },
//   userMessageText: {
//     fontSize: 17,
//     color: "#000",
//   },
//   aiMessage: {
//     backgroundColor: "#4a90e2",
//   },
//   messageText: {
//     fontSize: 17,
//     color: "#fff",
//   },
//   inputContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#ffffff",
//     padding: 8,
//     borderRadius: 20,
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//     elevation: 5,
//     marginBottom: 10,
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     paddingHorizontal: 10,
//     color: "#333",
//   },
//   iconButton: {
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: "#007AFF",
//     marginLeft: 5,
//   },
//   sendButton: {
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: "green",
//     marginLeft: 5,
//   },
// });

// export default GeminiChat;






// import React, { useState, useEffect } from "react";
// import * as GoogleGenerativeAI from "@google/generative-ai";
// import {
//   View,
//   Text,
//   TextInput,
//   FlatList,
//   StyleSheet,
//   ActivityIndicator,
//   TouchableOpacity,
// } from "react-native";
// import * as Speech from "expo-speech";
// import { FontAwesome } from "@expo/vector-icons";
// import { Entypo } from "@expo/vector-icons";
// import FlashMessage, { showMessage } from "react-native-flash-message";

// const GeminiChat = () => {
//   const [messages, setMessages] = useState([]);
//   const [userInput, setUserInput] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [showStopIcon, setShowStopIcon] = useState(false);

//   const API_KEY = "AIzaSyCzXZKMJaEi0bvz7T-TnIbveZgPM73vspk";

//   useEffect(() => {
//     const startChat = async () => {
//       try {
//         const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
//         const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//         const prompt = "hello! ";
//         const result = await model.generateContent(prompt);
//         const response = result.response;
//         const text = response.text();
//         console.log(text);
//         showMessage({
//           message: "Welcome to Gemini Chat 🤖",
//           description: text,
//           type: "info",
//           icon: "info",
//           duration: 2000,
//         });
//         setMessages([
//           {
//             text,
//             user: false,
//           },
//         ]);
//       } catch (error) {
//         console.error("Error starting chat:", error);
//         showMessage({
//           message: "Error starting chat",
//           description: error.message,
//           type: "danger",
//           duration: 3000,
//         });
//       }
//     };
//     //function call
//     startChat();
//   }, []);

//   const sendMessage = async () => {
//     setLoading(true);
//     const userMessage = { text: userInput, user: true };
//     setMessages([...messages, userMessage]);

//     try {
//       const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
//       const model = genAI.getGenerativeModel({ model: "gemini-pro" });
//       const prompt = userMessage.text;
//       const result = await model.generateContent(prompt);
//       const response = result.response;
//       const text = response.text();
//       setMessages([...messages, { text, user: false }]);
//       setLoading(false);
//       setUserInput("");

//       if (text && !isSpeaking) {
//         Speech.speak(text);
//         setIsSpeaking(true);
//         setShowStopIcon(true);
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//       showMessage({
//         message: "Error sending message",
//         description: error.message,
//         type: "danger",
//         duration: 3000,
//       });
//       setLoading(false);
//     }
//   };

//   const toggleSpeech = () => {
//     console.log("isSpeaking", isSpeaking);
//     if (isSpeaking) {
//       Speech.stop();
//       setIsSpeaking(false);
//     } else {
//       Speech.speak(messages[messages.length - 1].text);
//       setIsSpeaking(true);
//     }
//   };

//   const clearChat = () => {
//     setMessages([]);
//     setIsSpeaking(false);
//     setShowStopIcon(false);
//     Speech.stop(); // Stop any ongoing speech
//   };

//   const renderMessage = ({ item }) => (
//     <View style={styles.messageContainer}>
//       <Text style={[styles.messageText, item.user && styles.userMessage]}>
//         {item.text}
//       </Text>
//     </View>
//   );

//   return (
//     <View style={styles.container}>
//       <FlatList
//         data={messages}
//         renderItem={renderMessage}
//         keyExtractor={(item) => item.text}
//         inverted
//       />
//       <View style={styles.inputContainer}>
//         <TouchableOpacity style={styles.micIcon} onPress={toggleSpeech}>
//           {isSpeaking ? (
//             <FontAwesome
//               name="microphone-slash"
//               size={24}
//               color="white"
//               style={{
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//             />
//           ) : (
//             <FontAwesome
//               name="microphone"
//               size={24}
//               color="white"
//               style={{
//                 justifyContent: "center",
//                 alignItems: "center",
//               }}
//             />
//           )}
//         </TouchableOpacity>
//         <TextInput
//           placeholder="Type a message"
//           onChangeText={setUserInput}
//           value={userInput}
//           onSubmitEditing={sendMessage}
//           style={styles.input}
//           placeholderTextColor="#fff"
//         />
//         {showStopIcon && (
//           <TouchableOpacity style={styles.stopIcon} onPress={clearChat}>
//             <Entypo name="controller-stop" size={24} color="white" />
//           </TouchableOpacity>
//         )}
//         <TouchableOpacity style={styles.clearIcon} onPress={clearChat}>
//           <Entypo name="trash" size={24} color="white" />
//         </TouchableOpacity>
//         {/* {loading && <ActivityIndicator size="large" color="black" />} */}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#ffff", marginTop: 50 },
//   messageContainer: { padding: 10, marginVertical: 5 },
//   messageText: { fontSize: 16 },
//   inputContainer: { flexDirection: "row", alignItems: "center", padding: 10 },
//   input: {
//     flex: 1,
//     padding: 10,
//     backgroundColor: "#131314",
//     borderRadius: 10,
//     height: 50,
//     color: "white",
//   },
//   micIcon: {
//     padding: 10,
//     backgroundColor: "#131314",
//     borderRadius: 25,
//     height: 50,
//     width: 50,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 5,
//   },
//   stopIcon: {
//     padding: 10,
//     backgroundColor: "#131314",
//     borderRadius: 25,
//     height: 50,
//     width: 50,
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 3,
//   },
//   clearIcon: {
//     padding: 10,
//     backgroundColor: "#131314",
//     borderRadius: 25,
//     height: 50,
//     width: 50,
//     justifyContent: "center",
//     alignItems: "center",
//     marginLeft: 3,
//   },
// });

// export default GeminiChat;