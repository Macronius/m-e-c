//javascript library
import React, { useContext, useEffect, useReducer } from 'react';
//ajax requests
import axios from 'axios';
//react google charts
import Chart from 'react-google-charts';
//components
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
//components - third party
import { Helmet } from 'react-helmet-async';
//context
import { Store } from '../store';
//utility functions
import { getError } from '../utils';
//style - react bootstrap
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

//define reducer to fetch dashboard data from the backend
const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, summary: action.payload };
    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default function DashboardScreen() {
  //useReducer
  const [{ loading, summary, error }, dispatch] = useReducer(reducer, {
    loading: true,
    error: '',
    //summary: by not acknowledging summary in initial state settings, it is defaulted as undefined
  });
  //get userInfo from state from store-context: required for authentication
  const { state } = useContext(Store);
  const { userInfo } = state;
  
  // INITIALIZE - useEffect to ajax-request/fetch to get dashboard data
  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({type: 'FETCH_REQUEST'});
        const { data } = await axios.get('/api/orders/summary', {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        });
        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        console.log('failed fetch attempt from DashboardScreen useEffect()');
        dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
      }
    };
    fetchData();
  }, [userInfo]);

  return (
    <div>
      <Helmet>
        <title>Admin Dashboard</title>
      </Helmet>
      <h1>Admin Dashboard</h1>
      {/* loading UX */}
      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        // show summary data here
        <>
          <Row>
            {/* column 1 */}
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.users && summary.users[0]
                      ? summary.users[0].numUsers
                      : 0}
                  </Card.Title>{' '}
                  {/*QUESTION: summary.users[i].numUsers  where is 'summary' made available?*/}
                  <Card.Text> Users</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            {/* column 2 */}
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Title>
                    {summary.orders && summary.users[0]
                      ? summary.orders[0].numOrders
                      : 0}
                  </Card.Title>{' '}
                  {/*QUESTION: summary.orders[i].numUsers  where is 'summary' made available?*/}
                  <Card.Text> Orders</Card.Text>
                </Card.Body>
              </Card>
            </Col>
            {/* column 3 */}
            <Col md={4}>
              <Card>
                <Card.Body>
                  <Card.Header>
                  <Card.Title>
                      $
                      {summary.orders && summary.users[0]
                        ? summary.orders[0].totalSales.toFixed(2)
                        : 0}
                    </Card.Title>
                  </Card.Header>
                    {' '}
                  {/*QUESTION: summary.orders[i].numUsers  where is 'summary' made available?*/}
                  <Card.Text> Total Sales</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/*  */}
          {/* ----- SUMMARY REPORTS -------------------- */}
          {/* SALES REPORT */}
          <div className="my-3">
            <h2>Sales</h2>
            {summary.dailyOrders.length === 0 ? (
              <MessageBox>No Sale</MessageBox>
            ) : (
              <Chart
                width="100%"
                height="400px"
                chartType="AreaChart"
                loader={<div>Loading chart...</div>}
                data={[
                  ['Date', 'Sales'],
                  ...summary.dailyOrders.map((x) => [x._id, x.sales]), //TODO: add unit to sales axis
                ]}
              ></Chart>
            )}
          </div>
            {/* CATEGORIES REPORT */}
          <div className="my-3">
            <h2>Categories</h2>
            {
                summary.productCategories.length === 0 ? (
                    <MessageBox>No Categories</MessageBox>
                ) : (
                    <Chart
                        width='100%'
                        height='400px'
                        chartType='PieChart'
                        loader={<div>Loading Chart...</div>}
                        data={[
                            ['Category #', '# Products'],
                            ...summary.productCategories.map(x => [x._id, x.count]),
                        ]}
                    ></Chart>
                )
            }
          </div>
        </>
      )}
    </div>
  );
}
