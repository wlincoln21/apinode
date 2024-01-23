const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, getDocs, collection, where, query, updateDoc, doc, Timestamp, setDoc, and, addDoc, FieldValue, serverTimestamp } = require('firebase/firestore');
const { getAuth, verifyIdToken } = require('firebase/auth');
const admin = require('firebase-admin');
var serviceAccount = require('./serviceAccountKey.json');


require('dotenv').config();


const firebaseConfig = {
    apiKey: "AIzaSyAmSK-dxDbbhx-FB0AJarkF5q9DuNgdKxo",
    authDomain: "barber2-99558.firebaseapp.com",
    projectId: "barber2-99558",
    storageBucket: "barber2-99558.appspot.com",
    messagingSenderId: "179573136796",
    appId: "1:179573136796:web:b7a6760198b68d5720bc59"
};

const firebaseApp = initializeApp(firebaseConfig)
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

// Middleware para verificar o token de autorização
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Usuário não autorizado" });
    }

    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ error: "Formato de token inválido" });
    }

    const authToken = tokenParts[1];

    try {
        const decodedToken = await admin.auth().verifyIdToken(authToken);
        req.decodedToken = decodedToken; // Adiciona o token decodificado ao objeto de solicitação para uso posterior
        next(); // Chama a próxima função (rota ou middleware)
    } catch (e) {
        return res.status(401).json({ error: "Usuário não autorizado" });
    }
};
// FUNCOES PARA LIST PROFESSIONALS
// ================================

//List professionals
app.get('/api/professionals/', verifyToken, async (req, res) => {

    admin.firestore()
        .collection('users')
        .where('isProfessional', '==', true)     
        .get()
        .then(snapshot => {
            const listProfessional = snapshot.docs.map(doc => ({
                ...doc.data(),
                uid: doc.id,
            }));
            res.json(listProfessional);
        });
});
// APIS PARA AGENDAMENTO DE ATENDIMENTO OU CANCELAMENTO
app.get('/api/list-professionals/', verifyToken, async (req, res) => {

        admin.firestore()
            .collection('users')
            .where('isProfessional', '==', true)
            .where('isAusent', '==', false)
            .get()
            .then(snapshot => {
                const listProfessional = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    uid: doc.id,
                }));
                const shuffledProfessionals = listProfessional.sort(() => Math.random() - 0.5);
                res.json(shuffledProfessionals);
                

            });
});
// Rota para atualizar o status do profissional para ausente
app.put('/api/professionals/:id/abset', verifyToken,async (req, res) => {
    try {
        const professionalId = req.params.id;
         await admin.firestore()
            .collection('users')
            .where('userId', '==', professionalId)
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    doc.ref.update({
                        isAusent: true
                    });
                });
            });

        res.status(200).json({ message: 'Professional is now Absent' });
    } catch (error) {
        console.error('Error when the professional is absent:', error);
        res.status(500).json({ message: 'Erro ao ausentar o professional' });
    }
});
// Defina a rota para confirmar o agendamento
app.post('/api/confirmar-agendamento', verifyToken, async (req, res) => {
    try {
        const currentDate = new Date();
        const timestamp = admin.firestore.Timestamp.fromDate(currentDate);

        const appointmentDetails = req.body;

        console.log('Recebido do cliente:', appointmentDetails);

        const agendamentosCollection = collection(db, 'agendamentos');

        await addDoc(agendamentosCollection, {
            ...appointmentDetails,
            userId: user.uid,  // Certifique-se de incluir o userId
            dateRegister: serverTimestamp()
        });
        res.status(200).json({ success: true, message: 'Agendamento confirmado com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar o agendamento:', error);
        res.status(500).json({ success: false, message: 'Erro ao confirmar o agendamento.' });
    }
});

// Rota para remover como professional
app.put('/api/professionals/:id/delete', verifyToken, async (req, res) => {
    try {
        const professionalId = req.params.id;
    
        await updateDoc(doc(db, 'users', professionalId), {
            isProfessional: false,
            isClient: true,
            isAusente: false
        });

        res.status(200).json({ success: true, message: 'Agendamento confirmado com sucesso!' });
    } catch (error) {
        console.error('Erro ao salvar o agendamento:', error);
        res.status(500).json({ success: false, message: 'Erro ao confirmar o agendamento.' });
    }
});
// Rota usando o middleware
app.get('/api/checkOwnership/:id', verifyToken, async (req, res) => {
    try {
        const id = req.params.id;

        if (!id) {
            console.error('ID inválido');
            return res.status(400).json({ error: 'ID inválido' });
        }
        const usersCollection = collection(db, 'users');
        const q = query(
            usersCollection,
            where('userId', '==', req.decodedToken.uid),
            where('isOwner', '==', true)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('Usuário não é o proprietário.');
            return res.status(403).json({ message: false });
        } else {
            console.log('Usuário é o proprietário.');
            return res.status(200).json({ message: true });
        }

    } catch (error) {
        console.error('Erro ao verificar propriedade:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
app.get('/api/checkProfessional/:id', verifyToken, async (req, res) => {

    try {
        const id = req.params.id;

        if (!id) {
            console.error('ID inválido');
            return res.status(400).json({ error: 'ID inválido' });
        }
        const usersCollection = collection(db, 'users');
        const q = query(
            usersCollection,
            where('userId', '==', req.decodedToken.uid),
            where('isProfessional', '==', true)
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            console.log('Usuário não é o proprietário.');
            return res.status(403).json({ message: false });
        } else {
            console.log('Usuário é o proprietário.');
            return res.status(200).json({ message: true });
        }

    } catch (error) {
        console.error('Erro ao verificar propriedade:', error);
        return res.status(500).json({ error: 'Erro interno no servidor' });
    }
});
// FUNCOES PARA Autenticacao
// ================================
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
