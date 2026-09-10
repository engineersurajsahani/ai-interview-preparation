import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyARrfLCmzJChI3dpCMoOkXh3Za3YTfsKEk",
  authDomain: "ai-interview-final.firebaseapp.com",
  projectId: "ai-interview-final",
  storageBucket: "ai-interview-final.firebasestorage.app",
  messagingSenderId: "366698450652",
  appId: "1:366698450652:web:fc20db1ee30cb22cc72e19"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const signUp = async (email, password, name) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      createdAt: new Date().toISOString(),
      interviews: 0,
      averageScore: 0,
      history: []
    });
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const logOut = async () => {
  await signOut(auth);
};

export const getUserData = async (userId) => {
  const docSnap = await getDoc(doc(db, "users", userId));
  return docSnap.exists() ? docSnap.data() : null;
};

export const saveInterviewResult = async (userId, result) => {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    const data = userDoc.data();
    const history = data.history || [];
    history.push({
      date: new Date().toISOString(),
      score: result.score,
      emotion: result.emotion || 'Neutral',
      posture: result.posture || 'Good',
      eyeContact: result.eyeContact || 'Good',
      voiceClarity: result.voiceClarity || 'Good',
      confidence: result.confidence || 70,
      fillerWords: result.fillerWords || 0,
      question: result.question || 'General'
    });
    const total = history.length;
    const totalScore = history.reduce((sum, item) => sum + item.score, 0);
    await updateDoc(userRef, {
      history: history,
      interviews: total,
      averageScore: Math.round(totalScore / total)
    });
    return true;
  } catch (error) {
    console.error("SaveInterview Error:", error);
    return false;
  }
};