from typing import Annotated

from semantic_kernel.agents import ChatCompletionAgent, ChatHistoryAgentThread
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion
from semantic_kernel.functions import kernel_function


class InsurancePlugin:
    @kernel_function(
        name="get_user_plan",
        description="指定したユーザーIDが現在加入している保険プランを取得します。",
    )
    def get_user_plan(
        self, user_id: Annotated[int, "ユーザーID（4桁の数字、例：1234）"]
    ) -> Annotated[str, "ユーザーが加入しているプラン名（例：'安心保証プラン'）"]:
        user_plan = "終身保証保険プラン"

        return user_plan


agent = ChatCompletionAgent(
    service=AzureChatCompletion(),
    name="InsuranceAssistant",
    instructions="あたなは保険会社のAIアシスタントです。",
    plugins=[InsurancePlugin],
)

thread = ChatHistoryAgentThread()
