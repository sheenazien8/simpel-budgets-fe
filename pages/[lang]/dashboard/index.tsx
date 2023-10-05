import React, { useEffect, useState } from "react";
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  UserIcon,
} from "@heroicons/react/20/solid";
import Link from "next/link";
import { useAuthAction, useDashboardAction } from "@/actions";
import { IOption, Layout, Select } from "@/ui";
import { IProfile, SummaryFinancialRecord } from "@/models";
import { formatMoney } from "@/utils/helper";
import { getDictionary, translate } from "../dictionaries";

export async function getStaticProps(props: any) {
  const dict = await getDictionary(props.params.lang);
  return {
    props: {
      lang: dict.dashboard,
      locale: props.params.lang,
    },
  };
}

export function getStaticPaths() {
  return {
    paths: [{ params: { lang: "id" } }, { params: { lang: "en" } }],
    fallback: false,
  };
}

export default function Page({ lang, locale }: any) {
  const { getProfile } = useAuthAction();
  const { financialRecord } = useDashboardAction();
  const [financialRecordOption, setFinancialRecordOption] = useState<IOption>({
    label: "1 bulan ini",
    value: "1 month",
  });
  const [financialRecordData, setFinancialRecordData] =
    useState<SummaryFinancialRecord[]>();
  const [profile, setProfile] = useState<IProfile>();
  useState<boolean>(false);
  const [greetingWord, setGreetingWord] = useState<string>("");
  const greeting = () => {
    const date = new Date();
    const hour = date.getHours();
    if (hour < 12) {
      setGreetingWord(
        translate(lang.greetingTime, { time: lang.greetingTimeMorning }),
      );
    } else if (hour < 18) {
      setGreetingWord(
        translate(lang.greetingTime, { time: lang.greetingTimeAfternoon }),
      );
    } else {
      setGreetingWord(
        translate(lang.greetingTime, { time: lang.greetingTimeNight }),
      );
    }
  };

  const load = async () => {
    const data = await getProfile();
    setProfile(data.data.data);
    greeting();
    const financialRecordData = await financialRecord({
      recapBy: financialRecordOption.value as string,
    });
    setFinancialRecordData(financialRecordData.data);
  };

  useEffect(() => {
    load();
  }, [financialRecordOption]);

  return (
    <Layout loading={financialRecordData == undefined}>
      <div>
        <Link href={`/${locale}/profiles`}>
          <div className="flex items-center gap-x-2 px-4">
            <UserIcon className="w-10 h-10 text-gray-400" />
            <div>
              <p className="text-lg font-semibold text-gray-600">
                {translate(lang.greetings, { username: profile?.name })}
              </p>
              <span className="text-gray-400">{greetingWord}</span>
            </div>
          </div>
        </Link>
        <div>
          <div className="flex gap-x-4 items-center z-0">
            <Select
              block
              name={"fincancial_record"}
              options={[
                { label: "7 hari terakhir", value: "7 days" },
                { label: "30 hari terakhir", value: "30 days" },
                { label: "1 bulan ini", value: "1 month" },
                { label: "3 bulan ini", value: "3 month" },
              ]}
              value={financialRecordOption.value}
              onChange={(e) => {
                setFinancialRecordOption({
                  value: e.target.value,
                  label: e.target.value,
                });
              }}
            />
          </div>
          <div className="">
            <div className="grid grid-cols-2 gap-3 my-4">
              {financialRecordData?.map((fincance, index) => (
                <div className="px-3 py-4 border border-gray-300 rounded-lg shadow-gray-300 shadow" key={index}>
                  <p className="font-light text-sm">{translate(lang.label, { label: fincance.label })}</p>
                  <p className="font-semibold text-base">
                    {formatMoney(fincance?.total)}
                  </p>
                  <p className="font-light text-xs flex items-center">
                    {fincance?.isUp ? (
                      <ArrowUpRightIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <ArrowDownLeftIcon className="w-5 h-5 text-red-500" />
                    )}{" "}
                    {fincance?.percentage}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
