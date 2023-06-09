import Image from 'next/image'
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link'
import getStripe from '@/lib/get-stripe';
import {
    BsXCircle,
    BsX,
    BsDash,
    BsPlus,
  } from 'react-icons/bs';
import { calcFrete, formatCurrency } from '@/lib/utils';
import { useShoppingCart } from '@/hooks/use-shopping-cart';
import axios from 'axios';
import products from '../../public/items-sample.json'
import Item from '@/components/item';
import { toast } from 'react-hot-toast';

export default function Details() {
    const { cartDetails, totalPrice, cartCount, addItem, removeItem, clearCart } = useShoppingCart();
    const [redirecting, setRedirecting] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);
    const [destino, setDestino] = useState('');
    const [servico, setServico] = useState(0);
    const [shippingOptions, setShippingOptions] = useState([{}] as [{name: string, value: string, delivery_method_id: number, business_days: number}]);
    const [shippingLoading, setShippingLoading] = useState(false);
    const toastId = useRef<string>();

    const redirectToCheckout = async () => {
        if(servico) {
            console.log(shippingOptions)
            console.log(shippingOptions.filter(el => el.delivery_method_id === servico))
            setRedirecting(true);
            const { data: { id } } = await axios.post('/api/checkout_sessions', {
                items: Object.entries(cartDetails).map(([_, { id, quantity }]) => ({
                    price: id,
                    quantity
                })),
                metadata: Object.entries(cartDetails).map(([_, { id, size, model }]) => ({
                    price: id,
                    size,
                    model
                })),
                shipping: shippingOptions.filter(el => el.delivery_method_id === servico)[0]
                }
            );
            const stripe = await getStripe();
            await stripe?.redirectToCheckout({ sessionId: id });
        } else 
            toast.error(`Necessário informar o CEP para o cálculo do frete`, {
                id: toastId.current,
            })
    }

    const calcFreteByDestino = async() => {
        setShippingLoading(true);
        const { data } = await axios.post('/api/correios', {
            destino
        });
        setShippingOptions(JSON.parse(data.data));
        setShippingLoading(false);
    }

    useEffect(() => {
      setHasMounted(true);
    }, []);

    if (!hasMounted) {
      return null;
    }

    return (
        <>
            <div className="md:container xl:max-w-screen-xl mx-auto py-12 p-2 md:px-6">
                {cartCount > 0 ? (
                <>
                    <h2 className="text-4xl font-semibold">Seu carrinho</h2>
                    <p className="mt-1 text-xl">
                    {cartCount} itens{' '}
                    <button
                        onClick={clearCart}
                        className="opacity-50 hover:opacity-100 text-base capitalize"
                    >
                        (Limpar tudo)
                    </button>
                    </p>
                </>
                ) : (
                <>
                    <h2 className="text-4xl font-semibold">
                    Seu carrinho está vazio.
                    </h2>
                    <div className="mt-1 text-xl">
                    Encontre alguns produtos{' '}
                    <Link href="/">
                        <span className="text-black-1000 underline">aqui!</span>
                    </Link>
                    </div>
                </>
                )}

                {cartCount > 0 ? (
                <div className="mt-12">
                    {Object.entries(cartDetails).map(([key, product]: [any, any]) => (
                    <div
                        key={key}
                        className="flex flex-col gap-4 mt-2 md:flex-row justify-between space-x-4 hover:shadow-lg hover:border-opacity-50 border border-opacity-0 rounded-md p-2 md:p-4"
                    >
                        {/* Image + Name */}
                        <Link href={`/details/${product.id}`}>
                        <div className="flex items-center space-x-4 group">
                            <div className="relative w-20 h-20 group-hover:scale-110 transition-transform">
                            <Image
                                src={product.srcImg}
                                alt={product.name}
                                fill
                                className='object-contain'
                                sizes="(max-width: 768px) 100vw,
                                (max-width: 1200px) 50vw,
                                33vw"
                            />
                            </div>
                            <div>
                                <p className="font-semibold text-xl group-hover:underline">
                                    {product.name}
                                </p>
                                <p className='text-gray-600'>
                                    Tamanho: {product.size.toUpperCase()}
                                </p>
                            </div>    
                        </div>
                        </Link>

                        {/* Price + Actions */}
                        <div className="flex items-center">
                        {/* Quantity */}
                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => removeItem(product)}
                                disabled={product?.quantity <= 1}
                                className="disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-current hover:bg-rose-100 hover:text-rose-500 rounded-md p-1"
                            >
                                <BsDash className="w-6 h-6 flex-shrink-0" />
                            </button>
                            <p className="font-semibold text-xl">{product.quantity}</p>
                            <button
                                onClick={() => addItem(product, 1, product?.size, product?.model)}
                                className="hover:bg-green-100 hover:text-green-500 rounded-md p-1"
                            >
                                <BsPlus className="w-6 h-6 flex-shrink-0 " />
                            </button>
                        </div>

                        {/* Price */}
                        <p className="font-semibold text-xl md:ml-16">
                            <BsX className="w-4 h-4 text-gray-500 inline-block" />
                            {formatCurrency(product.price)}
                        </p>

                        {/* Remove item */}
                        <button
                            onClick={() => removeItem(product, product.quantity)}
                            className="ml-4 hover:text-rose-500"
                        >
                            <BsXCircle className="w-6 h-6 flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity" />
                        </button>
                        </div>
                    </div>
                    ))}

                    <div className="flex flex-col justify-between border-t py-4 mt-8 gap-2">
                        <p>Calcule o frete:</p>
                        <div  className="flex flex-row justify-between gap-2">
                            <input className='border-gray-200 border-solid border-[1px] p-2 w-full md:w-1/2 rounded-md' 
                                type="destino" 
                                value={destino} 
                                onChange={e => setDestino(e.target.value)} />
                            <button disabled={shippingLoading} className='text-white bg-black-1000 w-fit md:w-1/2 self-end rounded-md px-5 py-3 
                                md:block disabled:opacity-50 disabled:cursor-not-allowed' 
                                onClick={calcFreteByDestino}>{shippingLoading ? 'Calculando...' : 'Calcular'}
                            </button>
                        </div>
            
                        { shippingOptions[0].delivery_method_id ?
                        <div className="flex flex-col justify-between mt-4 gap-2">
                            <p>Opções:</p>
                            <div className='flex flex-col justify-between gap-2'>
                                {shippingOptions.map((option: any) => { return (
                                    <label key={option.delivery_method_id} className='flex flex-row gap-2 items-center'>
                                    <input type='radio' value={option.delivery_method_id} name='service' 
                                        onChange={e => setServico(option.delivery_method_id)}/>
                                        {option.name}: {option.business_days} dias úteis - R$ {option.value}
                                    </label>)
                                })}
                            </div>
                        </div> : '' }
                    </div>

                    <div className="flex flex-col justify-between items-center md:items-end border-t py-4 mt-8 gap-2">
                    <p className="text-xl self-end">
                        Total:{' '}
                        <span className="font-semibold">
                        {formatCurrency(totalPrice)}
                        </span>
                    </p>
                    <button
                        onClick={redirectToCheckout}
                        disabled={redirecting}
                        className="text-white bg-black-1000 w-full self-end rounded-md px-5 py-3 md:mt-8 md:block disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {redirecting ? 'Redirecionando...' : 'Fechar Pedido'}
                    </button>
                    </div>

                    <div className='my-4 mt-24'>
                        <h1 className='font-extrabold text-black-1000 text-2xl'>VOCÊ TAMBÉM VAI CURTIR</h1>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-2 my-2'>
                            {products.slice(0, 4).map(item => {
                                return (
                                <Item 
                                    key={item.id}
                                    id={item.id}
                                    name={item.name} 
                                    gender={item.gender}
                                    price={item.price} 
                                    srcImg={item.srcImg}/>)
                            })}
                        </div>
                    </div>
                </div>
                
                ) : null}
            </div>           
        </>
    )
}