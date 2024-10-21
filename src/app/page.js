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

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch('/api/saveData', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (response.ok) {
        setName(result.name)
        setDiscountCode(result.discountCode);
        setState(true);
        setConfettiVisible(true);
        setTimeout(() => setConfettiVisible(false), 5000);
      } else {
        setErrorMessage(result.message); // Muestra el mensaje si hay algún error
      }
    } catch (error) {
      console.error('Error al enviar los datos:', error);
      setErrorMessage("Ocurrió un error. Inténtalo de nuevo.");
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
          errorMessage={errorMessage} />}
    </div>
  );
}


const Welcome = ({ handleSubmit, onSubmit, register, errors, errorMessage }) => {
  return (
    <>
      <div className='flex flex-col justify-center sm:gap-3 text-center' style={{ margin: 0 }}>
        <h1 className=' text-3xl text-gray-200 font-bold'>¿Lista para recibir tu código de descuento?</h1>
        <p className='text-xl text-gray-400 font-light'>Completá los siguientes datos:</p>
        {errorMessage && <p className="text-red-500">{errorMessage}</p>} {/* Mostrar mensaje de error */}
      </div>
      <form className='flex flex-col justify-center gap-2 sm:mt-5 md:mt-0' onSubmit={handleSubmit(onSubmit)}>
        <input
          type="text"
          id='nombre'
          placeholder='Primer nombre'
          {...register('nombre')}
          className=' text-white rounded-md shadow-md p-2 bg-black border border-white font-light w-full'
        />
        <p className=" font-light text-red-400">{errors.nombre?.message}</p>
        <input
          type="text"
          id="apellido"
          placeholder="Primer apellido"
          {...register('apellido')}
          className=' text-white rounded-md shadow-md p-2 bg-black border border-white font-light w-full'
        />
        <p className=" font-light text-red-400">{errors.apellido?.message}</p>
        <input
          type="tel"
          id='name'
          placeholder='Número de teléfono'
          {...register('telefono')}
          className=' text-white rounded-md shadow-md bg-black border border-white p-2 font-light w-full'
        />
        <p className="font-light text-red-400">{errors.telefono?.message}</p>
        <input
          type="text"
          id='name'
          placeholder='Dirección'
          {...register('direccion')}
          className=' text-white rounded-md shadow-md bg-black border border-white p-2 font-light w-full'
        />
        <p className="font-light text-red-400">{errors.correo?.message}</p>
        <button
          type="submit"
          className='bg-rose-600 p-2 shadow-md font-bold rounded-md'
        >
          Obtené tu descuento
        </button>
      </form>
    </>
  )
}

Welcome.propTypes = {
  handleSubmit: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,

}


const CodeGivawey = ({ isConfettiVisible, balloonAnimation, name, discountCode }) => {
  return (
    <>
      <div className='flex flex-col justify-center gap-4 text-center'>
        <div className='flex flex-col justify-center gap-3'>
          <h1 className=' text-3xl text-gray-200 font-bold'>{`Felicidades, ${name}`}</h1>
          <p className='text-xl text-gray-400 font-light'>Mostrá tu código en tienda o en compras en línea</p>

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

