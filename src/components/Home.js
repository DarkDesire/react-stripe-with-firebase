import { loadStripe } from '@stripe/stripe-js'
import React, { useState, useEffect, useContext } from 'react'
import db, { auth } from '../firebase'
import { collection, getDocs, onSnapshot, doc, query, where, addDoc } from "firebase/firestore"; 
import { UserContext } from '../UserContext'
import './Home.css'

const StripePubKey = ""
const Home = () => {
    const [products, setProducts] = useState([])
    const [subscription, setSubscription] = useState(null);
    const { user } = useContext(UserContext)
    useEffect(() => {
        const load = async () => {
            const colRef = collection(db, "customers", user.uid, "subscriptions")
            const subscriptionsSnapshot = await getDocs(colRef);
            console.log(subscriptionsSnapshot.empty ? "subscriptions zero": subscriptionsSnapshot)
            subscriptionsSnapshot.forEach( snapshot => {
                const subscription = snapshot.data()
                console.log('subscription', subscription)
                setSubscription({
                    role: subscription.role,
                    current_period_start: subscription.current_period_start,
                    current_period_end: subscription.current_period_end
                })
            })
        }
        load()
    }, [])

    useEffect(() => {
        const load = async () => {
            const productsRef = collection(db, "products");
            const q = query(productsRef, where('active', '==', true));
            const querySnapshot = await getDocs(q);
            console.log(querySnapshot.empty ? "products zero": querySnapshot)
    
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
            setProducts(products)
    
        }
        load()
    }, [])
    const checkOut = async (priceId) => {
        const add = async () => {
            const colRef = collection(db, "customers", user.uid, "checkout_sessions")
            const docRef = await addDoc(colRef, {
                price: priceId,
                success_url: window.location.origin,
                cancel_url: window.location.origin,
            })
            onSnapshot(docRef, async (snap) => {
                const { error, sessionId } = snap.data();
                if (error) {
                    console.log('error')
                    alert(error.message)
                }
                if (sessionId) {
                    console.log('sessionId')
                    const stripe = await loadStripe(StripePubKey);
                    stripe.redirectToCheckout({ sessionId })
                }
            })
        }
        add()
    }
    return <>
        <div>
            <h1>Welcome home  </h1>
            <p><button className="authButton" onClick={() => auth.signOut()}>Sign out</button></p>
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
