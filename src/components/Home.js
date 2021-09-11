import { loadStripe } from '@stripe/stripe-js'
import React, { useState, useEffect, useContext } from 'react'
import db, { auth } from '../firebase'
import { collection, getDocs, query, where, addDoc } from "firebase/firestore"; 
import { UserContext } from '../UserContext'
import './Home.css'

const Home = () => {
    const [products, setProducts] = useState([])
    const [subscription, setSubscription] = useState(null);
    const { user } = useContext(UserContext)
    useEffect(() => {
        const load = async () => {
            const colRef = collection(db, "customers", user.uid, "subscriptions")
            const subscriptionsSnapshot = await getDocs(colRef);
            console.log('subscriptionsSnapshot',subscriptionsSnapshot)
            subscriptionsSnapshot.forEach( snapshot => {
                console.log('snapshot',snapshot)
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
        const add = async () => {
            const colRef = collection(db, "customers", user.uid, "checkout_sessions")
            await addDoc(colRef, {
                price :priceId,
                success_url: window.location.origin,
                cancel_url: window.location.origin,
            });
            const sessionsSnapshot = await getDocs(colRef);
            sessionsSnapshot.forEach( async session => {
                console.log('session', session)
                const { error, sessionId } = session.data();
                if (error) {
                    console.log('error')
                    alert(error.message)
                }
                if (sessionId) {
                    alert(sessionId)
                    const stripe = await loadStripe("PK");
                    stripe.redirectToCheckout({ sessionId })
                }
            })
        }
        add()
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
