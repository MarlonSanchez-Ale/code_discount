"use client";
import Image from "next/image";
import { useState } from 'react'
import Omw_logo from '../../public/images/oldmanwinters_logo.webp'
import PropTypes from 'prop-types'
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import Confetti from "react-confetti";
import { useSpring, animated } from "react-spring";
import ClipLoader from 'react-spinners/ClipLoader';

const schema = yup.object({
  nombre: yup.string()
    .required("Debe ingresar su nombre completo")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/, 'El nombre solo puede contener letras sin espacios ni caracteres especiales'),
  apellido: yup.string()
    .required("Debe ingresar su apellido")
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+$/, 'El apellido solo puede contener letras sin espacios ni caracteres especiales'),
  telefono: yup.string().matches(/^[0-9]{8}$/, "El número de teléfono debe tener exactamente 8 dígitos, sin espacios ni caracteres especiales").required("Debe ingresar su teléfono"),
  direccion: yup.string().required("Debe ingresar su dirección")
})


export default function Home() {

  const [state, setState] = useState(false)
  const [isConfettiVisible, setConfettiVisible] = useState(false);
  const [name, setName] = useState("")
  const [discountCode, setDiscountCode] = useState(""); // Estado para el código de descuento
  const [errorMessage, setErrorMessage] = useState(""); // Estado para mensajes de error 
  const [isButtonClicked, setButtonClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false)
  const [isClientExisting, setClientExisting] = useState(false); // Estado para el popup del cliente existente
  const [existingClientData, setExistingClientData] = useState({ name: '', discountCode: '' }); // Información del cliente existente

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema)
  });


  const onSubmit = async (data) => {
    setIsLoading(true); // Iniciar carga
    setButtonClicked(true);
    setTimeout(() => setButtonClicked(false), 300);

    try {
      const response = await fetch('/api/saveData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        setName(result.name);
        setDiscountCode(result.discountCode);
        setState(true); // Mostrar la interfaz de éxito
        setConfettiVisible(true);
        setTimeout(() => setConfettiVisible(false), 5000);
        reset()
      } else {
        if (response.status === 400 && result.message.includes('El cliente ya está registrado')) {
          // Si el cliente ya existe, mostrar popup con nombre y código de descuento
          setExistingClientData({
            name: result.name,
            discountCode: result.discountCode
          });
          setClientExisting(true); // Mostrar el popup del cliente existente
          reset()
        } else {
          setErrorMessage(result.message); // Mostrar otros errores
        }
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      setErrorMessage("Ocurrió un error. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false); // Finalizar carga
    }
  };


  const balloonAnimation = useSpring({
    transform: isConfettiVisible ? "translateY(0px)" : "translateY(-500px)",
    opacity: isConfettiVisible ? 1 : 0,
    config: { tension: 180, friction: 12 }
  });


  return (
    <div className="grid grid-cols-1 place-items-center min-h-screen sm:p-10 md:gap-0 md:m-0 font-[family-name:var(--font-geist-sans)] m-0">
      <Image src={Omw_logo} width={200} height={200} alt="Old Man Winters logo" style={{ margin: 0 }} />
      {state ?
        <CodeGivawey
          isConfettiVisible={isConfettiVisible}
          balloonAnimation={balloonAnimation}
          name={name}
          discountCode={discountCode}

        />
        :
        <Welcome
          handleSubmit={handleSubmit}
          onSubmit={onSubmit}
          register={register}
          errors={errors}
          errorMessage={errorMessage}
          isButtonClicked={isButtonClicked}
          isLoading={isLoading}
        />}

      {isClientExisting && (
        <ExistingClientPopup
          existingClientData={existingClientData}
          onClose={() => setClientExisting(false)} // Cierra el popup
        />
      )}
    </div>
  );
}


const Welcome = ({ handleSubmit, onSubmit, register, errors, errorMessage, isButtonClicked, isLoading }) => {

  return (
    <>
      <div className='flex flex-col justify-center sm:gap-3 text-center' style={{ margin: 0 }}>
        <h1 className=' text-3xl text-gray-200 font-bold'>¿Lista para recibir tu código de descuento?</h1>
        <p className='text-xl text-gray-400 font-light'>Completá los siguientes datos:</p>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>} {/* Mostrar mensaje de error */}
      </div>
      <form className='flex flex-col justify-center lg:mt-5 gap-2 sm:mt-5 md:mt-0' onSubmit={handleSubmit(onSubmit)}>

        <label className=" text-gray-200 font-bold">Primer nombre: </label>
        <input
          type="text"
          id='nombre'
          placeholder='Armando'
          {...register('nombre')}
          className=' text-white rounded-md shadow-md p-2 bg-black border border-white font-light w-full'
        />
        <p className=" font-light text-red-400">{errors.nombre?.message}</p>

        <label className=" text-gray-200 font-bold">Primer apellido: </label>
        <input
          type="text"
          id="apellido"
          placeholder="Morales"
          {...register('apellido')}
          className=' text-white rounded-md shadow-md p-2 bg-black border border-white font-light w-full'
        />
        <p className=" font-light text-red-400">{errors.apellido?.message}</p>

        <label className=" text-gray-200 font-bold">Número de teléfono: </label>
        <input
          type="tel"
          id='telefono'
          placeholder='88888888'
          {...register('telefono')}
          className=' text-white rounded-md shadow-md bg-black border border-white p-2 font-light w-full'
        />
        <p className="font-light text-red-400">{errors.telefono?.message}</p>
        <label className=" text-gray-200 font-bold">Dirección: </label>
        <input
          type="text"
          id='direccion'
          placeholder='Ciudad, dirección de domicilio...'
          {...register('direccion')}
          className=' text-white rounded-md shadow-md bg-black border border-white p-2 font-light w-full'
        />
        <p className="font-light text-red-400">{errors.correo?.message}</p>
        {isLoading ? ( // Mostrar spinner si está en modo carga
          <div className="flex justify-center items-center">
            <ClipLoader color={"#C9184A"} loading={isLoading} size={50} />
          </div>
        ) : (
          <button
            type="submit"
            className={`bg-rose-700 p-2 shadow-md font-bold rounded-md transition-transform duration-150 w-full 
              ${isButtonClicked ? 'scale-95 bg-rose-500 shadow-lg' : 'scale-100'} 
              hover:scale-105 hover:bg-rose-600`}
          >
            Obtené tu descuento
          </button>
        )}
      </form>
    </>
  )
}

Welcome.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  isButtonClicked: PropTypes.bool.isRequired,
  isLoading: PropTypes.bool.isRequired
}

const ExistingClientPopup = ({ existingClientData, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 sm:p-5 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">{`¡Bienvenido de nuevo,  ${existingClientData.name}! 🎉`}</h2>
        <p className=" font-light text-gray-600 my-3">{`Parece que ya estás registrado en nuestra base de datos. Usá el código ${existingClientData.discountCode} en tu próxima compra`}</p>

        <button
          className="bg-rose-700 p-2 shadow-md font-bold rounded-md hover:bg-rose-600"
          onClick={onClose}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

ExistingClientPopup.prototype = {
  existingClientData: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,

}

const CodeGivawey = ({ isConfettiVisible, balloonAnimation, name, discountCode }) => {
  return (
    <>
      <div className='flex flex-col justify-center gap-4 text-center'>
        <div className='flex flex-col justify-center gap-3'>
          <h1 className=' text-3xl text-gray-200 font-bold'>{`¡Felicidades, ${name}!`}</h1>
          <p className='text-xl text-gray-400 font-light'>Tomá captura y mostrá tu código en tienda o en compras en línea</p>
        </div>
        <div className=' bg-black p-10 rounded-md shadow-md'>
          <h2 className='sm:text-4xl lg:text-7xl font-bold text-gray-50'>{discountCode}</h2>
        </div>

        <p className='text-xl text-yellow-300 font-light'>Válido del 21 al 25 de octubre 2024</p>


        {/* Confetti component */}
        {isConfettiVisible && <Confetti width={window.innerWidth} height={window.innerHeight} />}

        {/* Balloon animation */}
        {isConfettiVisible && (
          <animated.div style={{ ...balloonAnimation, position: "absolute", top: "100px", left: "50%" }}>
          </animated.div>
        )}
      </div>
    </>
  )
}

CodeGivawey.propTypes = {
  isConfettiVisible: PropTypes.bool.isRequired,
  balloonAnimation: PropTypes.object.isRequired,
  name: PropTypes.string.isRequired,
  discountCode: PropTypes.string.isRequired
}

