import {
  Button,
  FieldError,
  Form,
  Input,
  //Label,
  TextField,
} from "react-aria-components";
//import { InputCss, labelCss } from "../styles/reactAriaCss";
import { Checkbox } from "../styles/Checkbox";
import { useState } from "react";
import axios from "axios";
import TermsDialog from "../components/dialogs/TermsDialog";
import RulesDialog from "../components/dialogs/RulesDialog";
import { useNavigate } from "react-router-dom";
import LoadingOverlay from "../components/overlay/LoadingOverlay";
import Swal from "sweetalert2";
import useAuthStore from "../store/AuthStore";
interface Register {
  fullname: string;
  phone: string;
  email?: null | string;
  lineId: string;
  lineProfilePic: string;
  isTheOne: boolean;
  theOneId:string;
}
import { useUserStore } from "../store/userStore";
import { handleError, showAlert } from "../data/functions";

const RegisterPage = () => {
  const { setAccessToken } = useAuthStore();
  const { lineId, lineProfilePic, setUserId } = useUserStore();
  const navigate = useNavigate();
  const [register, setRegister] = useState<Register>({
    fullname: "",
    phone: "",
    lineId: lineId,
    lineProfilePic: lineProfilePic,
    isTheOne: false,
    theOneId: "",
  });

  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);
  const [isRulesAccepted, setIsRulesAccepted] = useState<boolean>(false);

  // const updateRegister = (field: keyof Register, value: string) => {
  //   setRegister((prevState) => ({
  //     ...prevState,
  //     [field]: value,
  //   }));
  // };
  const updateRegister = (field: keyof Register, value: string) => {
    setRegister((prevState) => {
      if (field === "email" && value === "") {
        const { email, ...rest } = prevState;
        return rest;
      }

      return {
        ...prevState,
        [field]: value,
      };
    });
  };

  //handle checkbox
  const handleTermsCheckboxChange = () => {
    setIsTermsAccepted((prevState) => {
      const newState = !prevState;

      if (newState === true) {
        setIsTermsOpen(true);
      }

      return newState;
    });
    //console.log(isTermsAccepted);
  };

  const handleTheOne = () => {
    setRegister((prevState) => ({
      ...prevState,
      isTheOne: !prevState.isTheOne,
    }));

    //console.log(register.isTheOne);
  };

  const handleRulesCheckboxChange = () => {
    setIsRulesAccepted((prevState) => {
      const newState = !prevState;

      if (newState === true) {
        setIsRulesOpen(true);
      }
      return newState;
    });
    console.log(isRulesAccepted);
  };

  //custom validate form
  interface Errors {
    phone?: string;
    theOneId?: string;
    email?: string;
  }
  const [error, setError] = useState<Errors>({});

  const validatePhone = () => {
    let phoneError = "";

    if (register.phone) {
      if (register.phone[0] !== "0") {
        phoneError = "หมายเลขโทรศัพท์จะต้องขึ้นต้นด้วยเลข 0";
      } else if (register.phone.length !== 10) {
        phoneError = "กรุณากรอกหมายเลขโทรศัพท์ให้ครบทั้ง 10 หลัก";
      }
    } else {
      phoneError = "กรุณากรอกหมายเลขโทรศัพท์";
    }

    setError((prevErrors) => ({
      ...prevErrors,
      phone: phoneError,
    }));
    //console.log("After setError", error);
  };

  const validateEmail = () => {
    let emailError = "";

    if (register.email) {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(register.email)) {
        emailError = "กรุณากรอกอีเมลให้ถูกต้อง";
      }

      if (/\s/.test(register.email)) {
        emailError = "กรุณากรอกอีเมลให้ถูกต้อง โดยไม่มีช่องว่าง";
      }
    }
    setError((prevErrors) => ({
      ...prevErrors,
      email: emailError,
    }));

    //console.log("After setError", emailError);
  };
  // Validate theOneId only if isTheOne is true
  // const validateTheOneId = () => {
  //   let theOneError = "";
  //   if (register.isTheOne) {
  //     if (!register.theOneId) {
  //       theOneError = "กรุณากรอกหมายเลข The1";
  //     }
      
  //   }
  //   setError((prev) => ({ ...prev, theOneId: theOneError }));
  // };
  //Dialog logic
  const [isTermsOpen, setIsTermsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);

  const handleTermsDialogClose = () => {
    setIsTermsOpen(false);
  };

  const handleRulesDialogClose = () => {
    setIsRulesOpen(false);
  };

  //submit form
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // const mockFunctionWithDelay = async () => {
  //   await new Promise((resolve) => setTimeout(resolve, 2000));
  // };

  const handleRegisterSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //console.log("register:", register);
    // If user isTheOne, ensure theOneId is validated
    // if (register.isTheOne) {
    //   validateTheOneId();
    //   if (!register.theOneId) {
    //     // If it's empty, show an error and stop submission
    //     Swal.fire({
    //       icon: "error",
    //       text: "กรุณากรอกหมายเลขสมาชิก The1 Card",
    //       confirmButtonText: "ยืนยัน",
    //       customClass: {
    //         htmlContainer: "font-kanit",
    //         confirmButton: "bg-gray-700 text-white rounded-md font-kanit",
    //       },
    //     });
    //     return;
    //   }
    // }

    if (!isTermsAccepted) {
      Swal.fire({
        icon: "error",
        text: "กรุณายอมรับเงื่อนไขและกติการเข้าร่วมกิจกรรม",
        confirmButtonText: "ยืนยัน",
        customClass: {
          htmlContainer: "font-kanit",
          confirmButton: "bg-gray-700 text-white rounded-md font-kanit",
        },
      });
      //alert("Please accept the terms and conditions.");
    } else {
      //console.log("Form submitted successfully:", register);

      try {
        setIsLoading(true);
        const response = await axios.post("/user/register", register);
        //console.log("Form submitted successfully:", response.data);
        if (response?.data?.response.jwt) {
          //console.log("JWT Token:", response.data.response.accessToken); // Log the JWT token
          const { jwt } = response.data.response;
          const { userId } = response.data.response.user.lineId;
          setAccessToken(jwt);
          setUserId(userId);

          setIsLoading(false);
          navigate("/success");
        } else {
          throw new Error("JWT Token not found in response.");
        }

        
      } catch (error) {
        setIsLoading(false);
        if (axios.isAxiosError(error)) {
          // Extracting the message sent from backend
          const errorMessage = error.response?.data?.message || error.message;
          Swal.fire({
            icon: "error",
            text: errorMessage,
            confirmButtonText: "ยืนยัน",
            customClass: {
              htmlContainer: "font-kanit",
              confirmButton: "bg-gray-700 text-white rounded-md font-kanit",
            },
          });
        } else if (error instanceof Error) {
          handleError(error);
        } else {
          showAlert("เกิดข้อผิดพลาดในการลงทะเบียน", "error");
        }
      }
    }
  };

  return (
    <div className="font-kanit bg-[var(--bg)] w-full min-h-screen h-full flex flex-col justify-center items-center relative ">
      {/* Overlay for loading */}
      {isLoading && <LoadingOverlay />}
      <div className="w-full h-full min-h-[400px] bg-white md:w-96 ">
        <img src="banner_major.webp" alt="header1page" className="w-full" />
      </div>
       
  
      {/* Content */}
      <div className=" flex flex-col justify-start items-center w-[90%] md:w-96 md:h-[34rem] min-h-[40rem] text-center gap-5 py-5 px-2 mt-5 ">
      <h1 className="text-3xl text-[var(--text)]">ลงทะเบียน</h1>
        <Form
          className="flex flex-col items-center gap-8 w-full"
          onSubmit={handleRegisterSubmit}
        >
          <div className="flex flex-col gap-6 w-full">
            {/* Fullname */}
            <TextField
              isRequired
              name="fullname"
              type="text"
              className="relative w-full"
            >
              <Input
                className="w-full px-4 py-2.5 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent "
                placeholder="*ชื่อ-นามสกุล"
                value={register.fullname}
                onChange={(e) => {
                  let newValue = e.target.value;

                  // Count how many spaces are in the string
                  const spaceCount = (newValue.match(/\s/g) || []).length;
                  if (spaceCount > 2) {
                    // If user typed a second space, remove the last typed character
                    newValue = newValue.slice(0, -1);
                  }

                  // Update state with the cleaned string
                  updateRegister("fullname", newValue);
                }}
              />
              {/* <Label className="absolute left-1 -top-5 px-1 text-sm text-black transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm">
                *ชื่อ-นามสกุล
              </Label> */}
              <div className="w-full mt-1 text-start">
                <FieldError className="text-red-800 text-xs md:text-sm">
                  กรุณากรอกชื่อ-นามสกุล
                </FieldError>
              </div>
            </TextField>

            {/* Phone */}
            <TextField
              isRequired
              name="phone"
              isInvalid={!!error.phone}
              className="relative w-full"
              type="text"
            >
              <Input
                className="w-full px-4 py-2.5 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent "
                placeholder="*เบอร์โทรศัพท์"
                value={register.phone}
                onChange={(e) => {
                  const numericValue = e.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
                  updateRegister("phone", numericValue);
                  validatePhone();
                }}
                onBlur={validatePhone}
              />
              {/* <Label className="absolute left-1 -top-5  px-1 text-sm text-black transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm">
                *เบอร์โทรศัพท์
              </Label> */}
              <div className="mt-1">
                <FieldError className="text-red-800 text-xs md:text-sm text-start">
                  {error.phone && <p>{error.phone}</p>}
                </FieldError>
              </div>
            </TextField>

            {/* Email */}
            <TextField
              isInvalid={!!error.email}
              name="email"
              className="relative w-full"
            >
              <Input
                className="w-full px-4 py-2.5 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent "
                placeholder="อีเมล"
                value={register.email || undefined}
                onChange={(e) => {
                  const noSpaces = e.target.value.replace(/\s/g, "");
                  updateRegister("email", noSpaces);
                  validateEmail();
                }}
                onBlur={validateEmail}
                onKeyDown={(e) => {
                  // If user presses space while input is empty, block it
                  if (e.key === " " && e.currentTarget.value.length === 0) {
                    e.preventDefault();
                  }
                }}
              />
              {/* <Label className="absolute left-1 -top-5 text-black px-1 text-sm  transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm">
                อีเมล
              </Label> */}
              <div className="mt-1">
                <FieldError className="text-red-800 text-xs md:text-sm text-start">
                  {error.email && <p>{error.email}</p>}
                </FieldError>
              </div>
            </TextField>

            <TextField
              name="theOneId"
              isInvalid={!!error.theOneId}
              className="relative w-full"
            >
              {/* <Input
                className="w-full px-4 py-2.5 text-base bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent "
                placeholder="หมายเลขสมาชิก The1"
                value={register.theOneId}
                onChange={(e) => {
                  // Remove everything except letters (A-Z, a-z) and digits (0-9)
                  const filteredValue = e.target.value.replace(/[^A-Za-z0-9]/g, "");
                  updateRegister("theOneId", filteredValue);
                  validateTheOneId();
                }}
                onBlur={validateTheOneId}
              /> */}
              {/* <Label className="absolute left-1 -top-5 text-black px-1 text-sm transition-all peer-placeholder-shown:top-2.5 peer-placeholder-shown:text-base peer-focus:-top-2.5 peer-focus:text-sm">
                หมายเลขสมาชิก The1
              </Label> */}
              <div className="mt-1">
                <Checkbox onChange={handleTheOne}>
                  <span className="text-[var(--text)]">เป็นสมาชิก The1 Card</span>
                </Checkbox>
              </div>
            </TextField>
          </div>


          
            
            {/* Split section line */}
            <div className="w-full border-t border-black my-1"></div>
          {/* Checkboxes */}
          <section className="flex flex-col gap-3 w-full">
            <Checkbox onChange={handleTermsCheckboxChange}>
              <span className="text-[var(--text)]">
                ยอมรับเงื่อนไข-นโยบายการให้ข้อมูลส่วนตัว
              </span>
            </Checkbox>
            <Checkbox onChange={handleRulesCheckboxChange}>
              <span className="text-[var(--text)]">
                ยอมรับเงื่อนไขและกติกาการร่วมกิจกรรม
              </span>
            </Checkbox>
          </section>
  
          {/* Submit Button */}
          <Button
            type="submit"
            className="flex text-lg justify-center transition transform hover:scale-105 focus:outline-none bg-[var(--button)] text-white rounded-lg w-[90%] p-1"
          >
            Register
          </Button>
        </Form>
  
        {/* Terms & Rules Dialogs */}
        <TermsDialog
          isTermsOpen={isTermsOpen}
          handleTermsDialogClose={handleTermsDialogClose}
        />
        <RulesDialog
          isRulesOpen={isRulesOpen}
          handleRulesDialogClose={handleRulesDialogClose}
        />
      </div>
  
      {/* Footer */}
      <div className="w-full h-20 md:h-32 relative"></div>
    </div>
  );
};

export default RegisterPage;
