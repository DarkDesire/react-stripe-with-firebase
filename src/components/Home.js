import { loadStripe } from '@stripe/stripe-js'
import React, { useState, useEffect, useContext } from 'react'
import db, { auth } from '../firebase'
import { collection, getDocs, query, where } from "firebase/firestore"; 
import { UserContext } from '../UserContext'
import './Home.css'

const Home = () => {
    const [products, setProducts] = useState([])
    const [subscription, setSubscription] = useState(null);
    const { user } = useContext(UserContext)
    //useEffect(() => {
        //const customersRef = collection(db, "cities");
        //const querySnapshot = await getDocs(customersRef);

        // db.collection("customers").doc(user.uid).collection("subscriptions").get().then(snapshot => {
        //     snapshot.forEach(subscription => {
        //         console.log('subscription', subscription.data())
        //         setSubscription({
        //             role: subscription.data().role,
        //             current_period_start: subscription.data().current_period_start,
        //             current_period_end: subscription.data().current_period_end

        //         })
        //     })
        // })
    //}, [])

    useEffect(() => {
        const load = async () => {
            const productsRef = collection(db, "products");
            const q = query(productsRef, where('active', '==', true));
            console.log(q)
            const querySnapshot = await getDocs(q);
    
            const products = {}
            querySnapshot.forEach( async doc => {
                // doc.data() is never undefined for query doc snapshots
                products[doc.id] = doc.data()
                const pricesRef = collection(db, "products", doc.id, "prices");
                const pricesSnapshot = await getDocs(pricesRef);
                pricesSnapshot.forEach( price => {
                    products[doc.id].prices = {
                        priceId: price.id,
                        priceData: price.data()
                    }
                })
            });
            console.log('products', products)
            console.log('Object.entries', Object.entries(products))
            setProducts(products)
    
        }
        load()
    }, [])
    const checkOut = async (priceId) => {
        console.log('checkout')
        const docRef = await db.collection("customers").doc(user.uid).collection("checkout_sessions").add({
            price: priceId,
            success_url: window.location.origin,
            cancel_url: window.location.origin,

        })
        docRef.onSnapshot(async (snap) => {
            const { error, sessionId } = snap.data();
            if (error) {
                console.log('error')
                alert(error.message)
            }
            if (sessionId) {
                console.log('sessionId')
                const stripe = await loadStripe("pk_test_51INW8eAI3J7s6NihgTfXwK6LckSo4tEJ1WhsoUmWGDftnJOBlXAXCSAqCVkSw89xsgAQjvtpMCTjTMknulKZ2wj900Nus791uw");
                stripe.redirectToCheckout({ sessionId })
            }
        })
    }
    return <>
        <div>
            <h1>Welcome home  </h1>
            <p><button onClick={() => auth.signOut()}>Sign out</button></p>
            {Object.entries(products).map(([productId, productData]) => {
                const isCurrentPlan = productData?.name?.toLowerCase().includes(subscription?.role)
                return (
                    <div className="plans" key={productId}>
                        <div>{productData.name} - {productData.description}</div>
                        <button disabled={isCurrentPlan} onClick={() => checkOut(productData.prices.priceId)}>Subscribe</button>
                    </div>
                )
            })}
        </div>
    </>
}

export default Home
