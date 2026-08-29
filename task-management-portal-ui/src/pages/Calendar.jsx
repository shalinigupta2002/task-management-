import { useLocation } from "react-router-dom";
import Layout from "../components/layouts/Layout";
import EmployeeLayout from "../components/layouts/EmployeeLayout";
import CalendarView from "../components/calendar/CalendarView";

export default function Calendar() {
  const isEmployee = useLocation().pathname.startsWith("/employee");
  const Wrapper = isEmployee ? EmployeeLayout : Layout;
  return (
    <Wrapper>
      <CalendarView />
    </Wrapper>
  );
}
