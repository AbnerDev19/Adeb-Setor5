// Lista de Igrejas do Setor 05
const igrejas = [
    { nome: "CANDANGOLÂNDIA - QD 05 (Local)", endereco: "QD 05 CJ A LJ 51, CEP: 71725500" },
    { nome: "SEDE DO SETOR 05 - N. Bandeirante", endereco: "Modulo S, 3ª Av, Comércio Ofício, CEP: 71710-350" },
    { nome: "GUARÁ II - QE 40", endereco: "QE 40 BL I LJ 08A, CEP: 71070400" },
    { nome: "GUARÁ I - QE 11", endereco: "QE 11 AE LT A, CEP: 71020611" },
    { nome: "LÚCIO COSTA", endereco: "Setor de Chácaras Lúcio Costa/Guará I (Endereço a atualizar)" },
    { nome: "VILA CAHUY", endereco: "SMPW Trecho 01, Vila Cahuy (Endereço a atualizar)" },
    { nome: "VARGEM BONITA - PARK WAY", endereco: "SMPW GD 16 LT 32, CEP: 70297-400" },
    { nome: "QUADRA 13 - PARK WAY", endereco: "SMPW Quadra 13, CEP: 71.741-300" },
    { nome: "VEREDA GRANDE - Arniqueiras", endereco: "SHA Conjunto 3 Chácara 38, CEP: 7199357" }
];

// Função para preencher o select ao carregar a página
function carregarIgrejas() {
    const select = document.getElementById('selectIgreja');
    
    igrejas.forEach(igreja => {
        const option = document.createElement('option');
        option.value = igreja.endereco; // Salva o endereço como valor
        option.textContent = igreja.nome; // Mostra o nome da igreja
        select.appendChild(option);
    });
}

// Chame esta função quando a página carregar
document.addEventListener('DOMContentLoaded', carregarIgrejas);