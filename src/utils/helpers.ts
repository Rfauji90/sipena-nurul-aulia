import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

export interface Teacher {
  id: string;
  name: string;
  gender: 'male' | 'female';
  unit: 'RA' | 'SD' | 'SMP';
  className: string;
  subject: string;
  position: string;
  archived?: boolean;
  archivedDate?: string;
}

export interface Supervision {
  id: string;
  teacherId: string;
  teacherName: string;
  teacherGender?: 'male' | 'female';
  unit?: 'RA' | 'SD' | 'SMP';
  date: string;
  score: number;
  grade: string;
  notes: string;
}

export interface HeadmasterNote {
  id: string;
  teacherId: string;
  teacherName: string;
  date: string;
  categories: string[];
  note: string;
}

export const calculateGrade = (score: number): string => {
  if (score >= 91 && score <= 100) {
    return 'A';
  } else if (score >= 81 && score <= 90) {
    return 'B';
  } else if (score >= 71 && score <= 80) {
    return 'C';
  } else {
    return 'D';
  }
};

export const getTeachers = async (): Promise<Teacher[]> => {
  try {
    const teachersCollection = collection(db, 'teachers');
    const snapshot = await getDocs(teachersCollection);
    const allTeachers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Teacher));
    
    // Filter out archived teachers
    return allTeachers.filter(teacher => !teacher.archived);
  } catch (error) {
    console.error('Error getting teachers:', error);
    return [];
  }
};

export const saveTeacher = async (teacher: Teacher): Promise<void> => {
  try {
    if (!teacher.id) {
      // Add new teacher
      const docRef = await addDoc(collection(db, 'teachers'), teacher);
      teacher.id = docRef.id;
    } else {
      // Update existing teacher
      const teacherDoc = doc(db, 'teachers', teacher.id);
      await updateDoc(teacherDoc, { ...teacher });
    }
  } catch (error) {
    console.error('Error saving teacher:', error);
  }
};

export const deleteTeacher = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'teachers', id));
  } catch (error) {
    console.error('Error deleting teacher:', error);
  }
};

export const getAdminSupervisions = async (unitFilter?: 'RA' | 'SD' | 'SMP'): Promise<Supervision[]> => {
  try {
    let supervisionsQuery = collection(db, 'adminSupervisions');
    const snapshot = await getDocs(supervisionsQuery);
    let supervisions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Supervision));
    
    if (unitFilter) {
      supervisions = supervisions.filter(s => s.unit === unitFilter);
    }
    
    return supervisions;
  } catch (error) {
    console.error('Error getting admin supervisions:', error);
    return [];
  }
};

export const saveAdminSupervision = async (supervision: Supervision): Promise<void> => {
  try {
    supervision.grade = calculateGrade(supervision.score);
    
    // Add unit information from teacher if missing
    if (!supervision.unit) {
      const teachers = await getTeachers();
      const teacher = teachers.find(t => t.id === supervision.teacherId);
      if (teacher) {
        supervision.unit = teacher.unit;
      }
    }
    
    if (!supervision.id) {
      // Add new supervision
      const docRef = await addDoc(collection(db, 'adminSupervisions'), supervision);
      supervision.id = docRef.id;
    } else {
      // Update existing supervision
      const supervisionDoc = doc(db, 'adminSupervisions', supervision.id);
      await updateDoc(supervisionDoc, { ...supervision });
    }
  } catch (error) {
    console.error('Error saving admin supervision:', error);
  }
};

export const deleteAdminSupervision = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'adminSupervisions', id));
  } catch (error) {
    console.error('Error deleting admin supervision:', error);
  }
};

export const getKBMSupervisions = async (unitFilter?: 'RA' | 'SD' | 'SMP'): Promise<Supervision[]> => {
  try {
    const supervisionsCollection = collection(db, 'kbmSupervisions');
    const snapshot = await getDocs(supervisionsCollection);
    let supervisions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Supervision));
    
    if (unitFilter) {
      supervisions = supervisions.filter(s => s.unit === unitFilter);
    }
    
    return supervisions;
  } catch (error) {
    console.error('Error getting KBM supervisions:', error);
    return [];
  }
};

export const saveKBMSupervision = async (supervision: Supervision): Promise<void> => {
  try {
    supervision.grade = calculateGrade(supervision.score);
    
    // Add unit information from teacher if missing
    if (!supervision.unit) {
      const teachers = await getTeachers();
      const teacher = teachers.find(t => t.id === supervision.teacherId);
      if (teacher) {
        supervision.unit = teacher.unit;
      }
    }
    
    if (!supervision.id) {
      // Add new supervision
      const docRef = await addDoc(collection(db, 'kbmSupervisions'), supervision);
      supervision.id = docRef.id;
    } else {
      // Update existing supervision
      const supervisionDoc = doc(db, 'kbmSupervisions', supervision.id);
      await updateDoc(supervisionDoc, { ...supervision });
    }
  } catch (error) {
    console.error('Error saving KBM supervision:', error);
  }
};

export const deleteKBMSupervision = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'kbmSupervisions', id));
  } catch (error) {
    console.error('Error deleting KBM supervision:', error);
  }
};

export const getClassicSupervisions = async (unitFilter?: 'RA' | 'SD' | 'SMP'): Promise<Supervision[]> => {
  try {
    const supervisionsCollection = collection(db, 'classicSupervisions');
    const snapshot = await getDocs(supervisionsCollection);
    let supervisions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Supervision));
    
    if (unitFilter) {
      supervisions = supervisions.filter(s => s.unit === unitFilter);
    }
    
    return supervisions;
  } catch (error) {
    console.error('Error getting classic supervisions:', error);
    return [];
  }
};

export const saveClassicSupervision = async (supervision: Supervision): Promise<void> => {
  try {
    supervision.grade = calculateGrade(supervision.score);
    
    // Add unit information from teacher if missing
    if (!supervision.unit) {
      const teachers = await getTeachers();
      const teacher = teachers.find(t => t.id === supervision.teacherId);
      if (teacher) {
        supervision.unit = teacher.unit;
      }
    }
    
    if (!supervision.id) {
      // Add new supervision
      const docRef = await addDoc(collection(db, 'classicSupervisions'), supervision);
      supervision.id = docRef.id;
    } else {
      // Update existing supervision
      const supervisionDoc = doc(db, 'classicSupervisions', supervision.id);
      await updateDoc(supervisionDoc, { ...supervision });
    }
  } catch (error) {
    console.error('Error saving classic supervision:', error);
  }
};

export const deleteClassicSupervision = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, 'classicSupervisions', id));
  } catch (error) {
    console.error('Error deleting classic supervision:', error);
  }
};

// Archive Teacher Functions
export const archiveTeacher = async (id: string): Promise<void> => {
  try {
    const teacherDoc = doc(db, 'teachers', id);
    await updateDoc(teacherDoc, { 
      archived: true,
      archivedDate: new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    });
  } catch (error) {
    console.error('Error archiving teacher:', error);
    throw error;
  }
};

export const unarchiveTeacher = async (id: string): Promise<void> => {
  try {
    const teacherDoc = doc(db, 'teachers', id);
    await updateDoc(teacherDoc, { 
      archived: false,
      archivedDate: null
    });
  } catch (error) {
    console.error('Error unarchiving teacher:', error);
    throw error;
  }
};

export const getArchivedTeachers = async (): Promise<Teacher[]> => {
  try {
    const teachersCollection = collection(db, 'teachers');
    const snapshot = await getDocs(teachersCollection);
    const allTeachers = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Teacher));
    
    // Filter only archived teachers
    return allTeachers.filter(teacher => teacher.archived);
  } catch (error) {
    console.error('Error getting archived teachers:', error);
    return [];
  }
};

// Headmaster Notes Functions
export const getHeadmasterNotes = async (): Promise<HeadmasterNote[]> => {
  try {
    const notesCollection = collection(db, 'headmasterNotes');
    const snapshot = await getDocs(notesCollection);
    return snapshot.docs
      .filter(doc => doc.id && doc.id.trim() !== '') // Filter out documents without valid IDs
      .map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HeadmasterNote));
  } catch (error) {
    console.error('Error getting headmaster notes:', error);
    return [];
  }
};

export const saveHeadmasterNote = async (note: HeadmasterNote): Promise<void> => {
  try {
    if (!note.id || note.id.trim() === '') {
      // Add new note - create a clean object without ID
      const { id, ...noteData } = note;
      await addDoc(collection(db, 'headmasterNotes'), noteData);
    } else {
      // Update existing note
      const noteDoc = doc(db, 'headmasterNotes', note.id);
      await updateDoc(noteDoc, { ...note });
    }
  } catch (error) {
    console.error('Error saving headmaster note:', error);
    throw error;
  }
};

export const deleteHeadmasterNote = async (id: string): Promise<void> => {
  try {
    // Validate that we have a proper ID before attempting deletion
    if (!id || typeof id !== 'string' || id.trim() === '') {
      throw new Error('Invalid document ID provided for deletion');
    }
    await deleteDoc(doc(db, 'headmasterNotes', id));
  } catch (error) {
    console.error('Error deleting headmaster note:', error);
    throw error; // Re-throw the error so it can be handled by the caller
  }
};