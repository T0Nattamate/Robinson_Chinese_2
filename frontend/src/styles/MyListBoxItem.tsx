import React from "react";
import { ListBoxItem } from "react-aria-components";

interface MyListBoxItemProps {
  children: React.ReactNode;
  textValue?: string;
  className?: string;
  isSelected?: boolean;
  isFocused?: boolean;
  id?: number | string;
}

const MyListBoxItem: React.FC<MyListBoxItemProps> = (props) => {
  return (
    <ListBoxItem
      {...props}
      textValue={props.children as string}
      className={({ isFocused }: { isFocused: boolean }) => `
        relative group cursor-default select-none py-2 pl-10 pr-4 outline-none rounded
        ${isFocused ? "bg-[--focus-bg] text-green-500" : "text-gray-900"}
      `}
    >
      {({ isSelected }: { isSelected: boolean }) => (
        <>
          <span
            className={`block truncate ${
              isSelected ? "font-medium" : "font-normal"
            }`}
          >
            {props.children}
          </span>
          {isSelected && (
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-[--focus-bg] group-data-[focused]:text-white">
              {/* <CheckIcon className="h-5 w-5" aria-hidden="true" /> */}
            </span>
          )}
        </>
      )}
    </ListBoxItem>
  );
};

export default MyListBoxItem;
