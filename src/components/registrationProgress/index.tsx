import React from 'react'
import FillDetails from './fillDetails'

export default function RegisterCards({ progress } : { progress: string }) {
  switch(progress) {
    case 'FILL_DETAILS':
      return <FillDetails />

    case "FORM_TEAM":
      return <p>Form team</p>

    case "SUBMIT_IDEA":
      return <p>Submit idea</p>

    case "PAYMENT":
      return <p>Payment</p>

    case "COMPLETE":
      return <p>Complete</p>
  }
}
