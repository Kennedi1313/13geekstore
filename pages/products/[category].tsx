import Item from '../../components/item'
import SearchMenu from '../../components/searchMenu'
import { useRouter } from "next/router";
let products = require('../../public/items-sample.json');
//const stripe = require('stripe')(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY);

export default function Home({ products }: any) {
  const { query: queryParams } = useRouter();
  const category = queryParams.category != undefined ? queryParams.category : "default";
  let productsArray = products
  productsArray = productsArray.filter((product: any) => product.categories.includes(category.toString().trim()))
  return (
    <>
        { productsArray ? 
        <div>
          <SearchMenu itemsCount={productsArray.length} category={category as string} />
          <div className='flex items-center justify-center px-2 md:px-8 py-5 my-2'>
            {/*<SideMenu/>*/}
            <div className='md:container center grid lg:grid-cols-4 grid-cols-2 w-full gap-2'>
              {productsArray.map((item: any) => {
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
        : ''}
    </>
  )
}

export async function getStaticPaths() {
  const paths = [
    {params: { category: 'filmes' }},
    {params: { category: 'series' }},
    {params: { category: 'jogos' }},
    {params: { category: 'geek' }}
  ]
  return { paths, fallback: false }
}

export const getStaticProps = async () => {
  // const { data: prices } = await stripe.prices.list({ active: true });
  // const products = await Promise.all(prices.map(async (price: any) => {
  //   const product = await stripe.products.retrieve(price.product)
  //   return {
  //     id: price.id,
  //     name: product.name,
  //     gender: product.metadata.gender,
  //     price: price.unit_amount,
  //     srcImg: product.images[0],
  //     categories: product.metadata.categories.replaceAll('"', '').split(',')
  //   }
  // }));

  return {
    props: {
      products
    }
  }
}