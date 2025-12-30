import { db, collection, addDoc } from './firebase-config.js';

let isAdmin = false;
const adminSection = document.getElementById('admin-section');
const loginText = document.getElementById('loginText');
const btnLogin = document.getElementById('btnLogin');
const btnSave = document.getElementById('btnSaveEvent');

// 1. Alternar Login (Simples)
btnLogin.addEventListener('click', () => {
    isAdmin = !isAdmin;
    if (isAdmin) {
        adminSection.style.display = "block";
        loginText.innerText = "Sair (Líder)";
        setTimeout(() => adminSection.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
        adminSection.style.display = "none";
        loginText.innerText = "Área do Líder";
    }
});

// 2. Salvar no Firebase
btnSave.addEventListener('click', async() => {
    const title = document.getElementById('evtTitle').value;
    const date = document.getElementById('evtDate').value;
    const loc = document.getElementById('evtLoc').value;

    if (!title || !date) {
        alert('Por favor, preencha o título e a data.');
        return;
    }

    btnSave.innerText = "Salvando...";
    btnSave.disabled = true;

    try {
        // Envia para o Firestore na coleção 'eventos'
        await addDoc(collection(db, "eventos"), {
            title: title,
            date: date,
            location: loc,
            time: '19:30', // Padrão, depois podemos criar campo pra isso
            createdAt: new Date()
        });

        alert('Evento salvo com sucesso!');

        // Limpar campos
        document.getElementById('evtTitle').value = '';
        document.getElementById('evtDate').value = '';
        document.getElementById('evtLoc').value = '';

    } catch (e) {
        console.error("Erro ao salvar: ", e);
        alert("Erro ao salvar o evento. Verifique o console.");
    } finally {
        btnSave.innerText = "Salvar Evento";
        btnSave.disabled = false;
    }
});