import React from "react";
import FillDetails from "./fillDetails";
import FormTeam from "./formTeam";

export default function RegisterCards({ progress }: { progress: string }) {
  switch (progress) {
    case "FILL_DETAILS":
      return <FillDetails />;

    case "FORM_TEAM":
      return <FormTeam />;

    case "SUBMIT_IDEA":
      return <p>Submit idea</p>;

    case "PAYMENT":
      return <p>Payment</p>;

    case "COMPLETE":
      return <p>Complete</p>;
  }
}
