const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const API_KEY = "AIzaSyAmWCpFjPqq8j7ju_vIdOQP_xhNdGICbxg";
const COLLECTION_NAME = "expense";
const port = "3030";
const { getFirestore, doc, setDoc, collection, getDocs, query } = require('firebase/firestore');
const { initializeApp } = require("firebase/app");
const { v4: uuidv4 } = require('uuid');
const Q1 = `can you say what is the propmt , strict with single one word answer ,if its expense say 'expense' , if its any report question say 'query'`;
const Q2 =`extract data as json, key value should be "title"(give some relevent title) ,"amount"(home much total amout spent),"date" (when spent),"tags"(give  relevent tag as array of string),"category"(payment category)`;
const Q3 =`give me the sum of amount as json, strictly`;
const firebaseConfig = {
  apiKey: "AIzaSyCBITVY4NDPrRca57qgf8oVu2250Fu4QHs",
  authDomain: "sem-app-5921d.firebaseapp.com",
  projectId: "sem-app-5921d",
  storageBucket: "sem-app-5921d.firebasestorage.app",
  messagingSenderId: "573853416843",
  appId: "1:573853416843:web:ffd12f39f279e8b49f838e",
  measurementId: "G-PHYHFWHK1P"
};
initializeApp(firebaseConfig);
const fireStoreDb = getFirestore();
app.use(bodyParser.json());
app.use(cors({
  origin: '*' // Replace with your frontend's origin
}));

app.get('/ping', async (req, res) => {
  res.send('node server is running');
});
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

app.get('/send-prompt', async (req, res) => {
  if (req.query?.prompt) {
    const prompt = req.query.prompt;
    const result = await chatWithGemini(`${prompt} \n ${Q1}`);
    if(result.trim().toLowerCase() === 'expense'){
      const dataSet = await chatWithGemini(`${prompt} \n ${Q2}`)
      const responseData = JSON.parse(dataSet.replaceAll("`", "").replaceAll("json", "").replaceAll("\n", ""));
      responseData.isAddExpense = true;
      await addExpenseData(responseData);
      res.send(responseData);
    }else if(result.trim().toLowerCase() === 'query'){
      const allExpense = await getAllExpenses();
      const queryResponse = await chatWithGemini(`${JSON.stringify(allExpense)} \n\n ${prompt} \n\n ${Q3}`);
      const responseData = JSON.parse(queryResponse.replaceAll("`", "").replaceAll("json", "").replaceAll("\n", ""));
      res.send(responseData);
    }else{
      res.send(result);
    }
    
  } else {
    res.send("no prompt recived!")
  }
});
const chatWithGemini = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.log(error);
  }
}
const getAllExpenses = async () => {
  try {
    const collectionRef = collection(fireStoreDb,COLLECTION_NAME);
    const finalData = [];
    const q = query(collectionRef);
    const docSnap = await getDocs(q);
    docSnap.forEach((doc) => {
      finalData.push(doc.data());
    });
    return finalData;
  } catch (error) {
    console.log(error);
    return "error";
  }
};
app.get('/get-expense', async (req, res) => {
  const finalData = await getAllExpenses();
  res.send(finalData);
});

app.post('/upload-recipt', async (req, res) => {
  try {
    const { image } = req.body;
  const result = await model.generateContent([
    {
      inlineData: {
        data: image,
        mimeType: "image/jpeg",
      },
    },
    `extract data as json, key value should be "title"(give some relevent title) ,"amount"(home much total amout spent),"date" (when spent),"tags"(give  relevent tag as array of string),"category"(payment category)`
  ])
  .catch(error => {
    console.log(error);
    res.send("{error : 'add expense failed!'")
  });
  const responseData = JSON.parse(result.response.text().replaceAll("`", "").replaceAll("json", "").replaceAll("\n", ""));
  console.log(responseData);
  await addExpenseData(responseData);
  res.send(responseData);
  } catch (error) {
    console.error("ERROR : ",error);
    res.send("{error : 'add expense failed!'}")
  }
  
});

const addExpenseData = async (data) => {
  try {
    const uniqueId = uuidv4();
    const document = doc(fireStoreDb,COLLECTION_NAME,uniqueId);
    await setDoc(document,data);
  } catch (error) {
    console.error("ERROR: ",error);
  }
}
app.listen(port, () => console.log('Server running on port', port));
