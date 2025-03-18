import React, { useState } from "react";
import { Modal, Form, Input, Select, InputNumber, message } from "antd";
import { getContractAddr } from "@/utils/contractsAddress";
import { parsePriceToSqrtPriceX96 } from "@/utils/index";
interface CreatePoolParams {
  token0: `0x${string}`;
  token1: `0x${string}`;
  fee: number;
  tickLower: number;
  tickUpper: number;
  sqrtPriceX96: bigint;
}
interface AddPoolModalProps {
  openInit: boolean;
  cancelInit: () => void;
  handleInit: (params: CreatePoolParams) => void;
}

const InitPool = (props: AddPoolModalProps) => {
  const { openInit, cancelInit, handleInit } = props;
  const [form] = Form.useForm();
  return (
    <>
      <Modal
        title="Create & Init Pool"
        open={openInit}
        styles={{ body: { textAlign: "left" } }}
        onCancel={() => {
          form.resetFields();
          cancelInit();
        }}
        okText={"Init"}
        onOk={async () => {
          await form.validateFields().then((values) => {
            if (values.token0 >= values.token1) {
              message.error("Token0 should be less than Token1");
              return false;
            }
            handleInit({
              ...values,
              sqrtPriceX96: parsePriceToSqrtPriceX96(values.price),
            });
            form.resetFields();
          });
        }}
      >
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            token0: getContractAddr("TestTokenA"),
            token1: getContractAddr("TestTokenB"),
            fee: 3000,
            tickLower: -887272,
            tickUpper: 887272,
            price: 1,
          }}
        >
          <Form.Item required label="Token 0" name="token0">
            <Input />
          </Form.Item>
          <Form.Item required label="Token 1" name="token1">
            <Input />
          </Form.Item>
          <Form.Item required label="Fee" name="fee">
            <Select>
              <Select.Option value={3000}>0.3%</Select.Option>
              <Select.Option value={500}>0.05%</Select.Option>
              <Select.Option value={10000}>1%</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item required label="Tick Lower" name="tickLower">
            <InputNumber />
          </Form.Item>
          <Form.Item required label="Tick Upper" name="tickUpper">
            <InputNumber />
          </Form.Item>
          <Form.Item required label="Init Price(token1/token0)" name="price">
            <InputNumber min={0.000001} max={1000000} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default InitPool;
