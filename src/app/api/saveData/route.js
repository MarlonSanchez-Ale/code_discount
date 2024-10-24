
import { NextResponse } from "next/server";
import { google } from "googleapis";
import { customAlphabet } from 'nanoid'; // Importar customAlphabet para generar códigos únicos
import { config } from 'dotenv';
config(); // Carga las variables de entorno desde el archivo .env

// ACCESOS A GOOGLE SHEETS
const SHEET_ID = "1Tmz3HmJNd88bOpYnHHokemzj0BjuvP0huYR2itRgiIo";
const SHEET_RANGE = 'descuentos!A:F'; // Asegúrate de que el rango sea correcto

const generateUniqueCode = () => {
    const alphabet = '0123456789';
    const nanoid = customAlphabet(alphabet, 4); // Código de 4 dígitos aleatorios
    return `OMW-${nanoid()}`;
};

function normalizeString(str) {
    if (typeof str !== 'string') return '';
    return str
        .toLowerCase() // Convierte a minúsculas
        .normalize('NFD') // Normaliza los caracteres unicode para separar acentos
        .replace(/[\u0300-\u036f]/g, ''); // Elimina los diacríticos (tildes)
}

function getCurrentDateTime() {
    const now = new Date();
    // Ajustar a la zona horaria local (Nicaragua está en UTC-6)
    const utcOffset = -6; // Ajuste en horas para UTC-6
    const localDateTime = new Date(now.getTime() + utcOffset * 60 * 60 * 1000);
    // Formato: YYYY-MM-DD HH:mm:ss
    return localDateTime.toISOString().slice(0, 19).replace('T', ' ');
}

export async function POST(req) {

    const { nombre, apellido, telefono, direccion } = await req.json();
    if (!nombre || !apellido || !telefono || !direccion) {
        return NextResponse.json({ message: 'Faltan datos requeridos.' }, { status: 400 });
    }
    let uniqueDiscountCode;

    if (!process.env.GOOGLE_CREDENTIALS) {
        console.error('Las credenciales de Google no están configuradas.');
        return NextResponse.json({ message: 'Error de configuración.' }, { status: 500 });
    }

    try {
        // Ruta hacia el archivo de credenciales JSON
        const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
        if (!credentials) {
            console.error('Las credenciales de Google no están configuradas.');
            return NextResponse.json({ message: 'Error de configuración.' }, { status: 500 });
        } else {
            console.log(credentials)
        }
        // Autenticación con Google Sheets
        const auth = new google.auth.GoogleAuth({
            credentials, // Usamos las credenciales cargadas desde el archivo
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        const sheets = google.sheets({ version: 'v4', auth });

        // Función para obtener todos los datos de la hoja de cálculo
        const getSheetData = async () => {
            const response = await sheets.spreadsheets.values.get({
                spreadsheetId: SHEET_ID,
                range: SHEET_RANGE,
            });
            return response.data.values || [];
        };

        // Recupera todos los datos de la hoja de cálculo en una sola llamada
        const sheetData = await getSheetData();

        // Verifica si el cliente ya está registrado
        const clientExists = sheetData.find((row) =>
            row.length >= 5 &&
            normalizeString(row[0]) === normalizeString(nombre) &&
            normalizeString(row[1]) === normalizeString(apellido)
        );

        if (clientExists) {
            const existingNombre = clientExists[0];
            const existingApellido = clientExists[1];
            const discountCode = clientExists[4];

            return NextResponse.json({
                message: 'El cliente ya está registrado.',
                name: `${existingNombre} ${existingApellido}`,
                discountCode
            }, {
                status: 400
            });
        }

        // Generar un código único y asegurarse de que no exista
        do {
            uniqueDiscountCode = generateUniqueCode();
        } while (sheetData.some((row) => row[4] === uniqueDiscountCode)); // Verifica si el código ya existe

         // Obtener la fecha y hora actuales
         const registrationDateTime = getCurrentDateTime();

        // Si no existe, agrega el cliente a la hoja de cálculo
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: SHEET_RANGE,
            valueInputOption: 'USER_ENTERED',
            resource: {
                values: [[nombre, apellido, telefono, direccion, uniqueDiscountCode, registrationDateTime]], // Guarda el código único
            },
        });

        return NextResponse.json({ message: 'Cliente registrado con éxito.', name: nombre, discountCode: uniqueDiscountCode }, { status: 200 });
    } catch (error) {
        console.error('Error al interactuar con Google Sheets:', error);
        return NextResponse.json({ message: 'Error al obtener datos.' }, { status: 500 });
    }
}
