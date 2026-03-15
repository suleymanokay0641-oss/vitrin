import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export function useQueryParams() {
  const [location] = useLocation();
  const [params, setParams] = useState(new URLSearchParams(window.location.search));

  useEffect(() => {
    setParams(new URLSearchParams(window.location.search));
  }, [location]);

  return params;
}
